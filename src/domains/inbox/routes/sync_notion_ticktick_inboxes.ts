import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import syncedInboxes, { SyncState } from "../models/syncedInboxes";
import Notion from "../repositories/notion";
import Ticktick from "../repositories/ticktick";
import Firestore from "../repositories/firestore";
import { arrayEquals } from "../../../core/utils";

export default class SyncNotionTicktickInboxes implements IRoute {
  notion: Notion;
  ticktick: Ticktick;
  db: Firestore;

  constructor(db: Firestore, notion: Notion, ticktick: Ticktick) {
    this.db = db;
    this.notion = notion;
    this.ticktick = ticktick;
  }

  async handler(req: Request, res: Response) {
    const inboxes = await this.db.getSyncedInboxes();

    for (const inbox of inboxes) {
      const prev = inbox.synced;
      const current = await this.getSyncedInboxesFromTheSources(prev);

      const state = this.compare(prev, current);

      await this.handleSyncState(
        inbox.id,
        state,
        prev,
        current as syncedInboxes
      );
    }
    res.send("done");
  }

  async handleSyncState(
    id: string,
    state: SyncState,
    prev: syncedInboxes,
    current: syncedInboxes
  ) {
    let isDone = false;
    if (state == SyncState.synced) {
      return;
    } else if (state == SyncState.deleted) {
      if (current.notion) await this.notion.deleteInbox(prev.notion.id);
      if (current.ticktick) await this.ticktick.deleteInbox(prev.ticktick.id);
      isDone = true;
    } else if (state == SyncState.notionOff) {
      await this.notion.updateInbox(current.notion.id, current.ticktick);
    } else if (state == SyncState.ticktickOff) {
      await this.ticktick.updateInbox(current.ticktick.id, current.notion);
    } else if (state == SyncState.notionDone) {
      await this.ticktick.updateInbox(current.ticktick.id, {
        done: true,
      });
      isDone = true;
    } else if (state == SyncState.tickticDone) {
      await this.notion.updateInbox(current.notion.id, {
        done: true,
      });
      isDone = true;
    }

    await this.db.deleteSyncedInboxes(id);
    if (!isDone) {
      await this.db.addSyncedInboxes(current);
    }
  }

  compare(prev: syncedInboxes, current: Partial<syncedInboxes>): SyncState {
    if (!current.notion || !current.ticktick) {
      return SyncState.deleted;
    } else if (current.notion && current.ticktick) {
      if (current.notion.title != current.ticktick.title) {
        if (current.notion.title == prev.notion.title) {
          return SyncState.notionOff;
        } else return SyncState.ticktickOff;
      }

      if (!arrayEquals(current.notion.tags, current.ticktick.tags)) {
        if (arrayEquals(current.notion.tags, prev.notion.tags)) {
          return SyncState.notionOff;
        } else return SyncState.ticktickOff;
      }

      if (current.notion.done) {
        return SyncState.notionDone;
      }
      if (current.ticktick.done) {
        return SyncState.tickticDone;
      }
    }

    return SyncState.synced;
  }

  async getSyncedInboxesFromTheSources(
    prev: syncedInboxes
  ): Promise<Partial<syncedInboxes>> {
    const notion = await this.notion.getInbox(prev.notion.id);
    const ticktick = await this.ticktick.getTask(
      prev.ticktick.id,
      prev.ticktick.parent
    );

    return {
      notion,
      ticktick,
    };
  }
}
