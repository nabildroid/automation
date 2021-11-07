import { Request, Response } from "express";
import { TaskReference } from "../../../core/entities/task";
import { IRoute } from "../../../core/service";
import NotionInbox from "../models/notion_inbox";
import syncedInboxes from "../models/syncedInboxes";
import Notion from "../repositories/notion";
import Ticktick from "../repositories/ticktick";
import Firestore from "../repositories/firestore";
import TicktickTask from "../../../core/entities/ticktick_task";
import TicktickClient from "../../../services/ticktick";

export default class NewInbox implements IRoute {
  notion: Notion;
  ticktick: Ticktick;
  db: Firestore;

  constructor(db: Firestore, notion: Notion, ticktick: Ticktick) {
    this.db = db;
    this.notion = notion;
    this.ticktick = ticktick;
  }

  // this endpoint is been called anytime a task get updated
  async handler(req: Request, res: Response) {
    const reference = this.parseRequestBody(req.body);
    console.log(reference);
    
    const newSynced = await this.createAssociatedTask(reference);
    await this.db.addSyncedInboxes(newSynced);

    res.send("the new task has been dispatched");
  }

  async createAssociatedTask(body: TaskReference) {
    const { id, parent, source } = body;
    let associatedTask: NotionInbox | TicktickTask;
    let task: NotionInbox | TicktickTask;

    if (source == "ticktick") {
      task = (await this.ticktick.getTask(id, parent))!;
      associatedTask = await this.notion.addToInbox({
        title: task.title,
        done: task.done,
        tags: task.tags,
        body: "", // todo implement this!
      });
    } else {
      task = (await this.notion.getInbox(id))!;
      associatedTask = await this.ticktick.addToInbox(task);
    }

    const syncedInboxes: syncedInboxes = {
      notion: task.source == "notion" ? task : (associatedTask as NotionInbox),
      ticktick:
        task.source == "ticktick" ? task : (associatedTask as TicktickTask),
    };

    return syncedInboxes;
  }

  private parseRequestBody(body: any): TaskReference {
    if (body.url) {
      if ((body.source as TaskReference["source"]) == "ticktick") {
        const { list, taskId } = TicktickClient.parseTaskUrl(body.url);

        return {
          id: taskId,
          parent: list,
          source: "ticktick",
        };
      } else if ((body.source as TaskReference["source"]) == "notion") {
        // BUG implement this!
      }
    }
    return body as TaskReference;
  }
}
