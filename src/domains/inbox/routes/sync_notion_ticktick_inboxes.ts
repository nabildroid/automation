import { Request, Response } from "express";
import Task from "../../../core/entities/task";
import { IRoute } from "../../../core/service";
import NotionInbox from "../models/notion_inbox";
import syncedInboxes from "../models/syncedInboxes";
import Notion from "../repositories/notion";
import Ticktick from "../repositories/ticktick";
import Firestore from "../repositories/firestore";
import TicktickTask from "../../../core/entities/ticktick_task";

export default class SyncNotionTicktickInboxes implements IRoute {
  notion: Notion;
  ticktick: Ticktick;
  db:Firestore;

  constructor(db:Firestore,notion: Notion, ticktick: Ticktick) {
    this.db = db;
    this.notion = notion;
    this.ticktick = ticktick;
  }

  async handler(req: Request, res: Response) {
    const { id, parent, source } = req.body.task as Task;
    let associatedTask: NotionInbox | TicktickTask;
    let task: NotionInbox | TicktickTask;

    if (source == "ticktick") {
      task = (await this.ticktick.getTask(id, parent))!;
      associatedTask = await this.notion.addToInbox(task.title);
    } else {
      task = (await this.notion.getInbox(id))!;
      associatedTask = await this.ticktick.addToInbox(task.title);
    }

    const syncedInboxes: syncedInboxes = {
      notion: task.source == "notion" ? task : (associatedTask as NotionInbox),
      ticktick:
        task.source == "ticktick" ? task : (associatedTask as TicktickTask),
    };

    await this.db.addSyncedInboxes(syncedInboxes);

    res.send(
      `${associatedTask.source} => inbox item ${associatedTask.id} has been created `
    );
  }
}
