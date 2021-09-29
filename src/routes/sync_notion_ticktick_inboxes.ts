import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import Task from "../core/entities/task";
import NotionInbox from "../entities/notion_inbox";
import TicktickTask from "../entities/ticktick_task";
import SyncedInboxes from "../entities/syncedInboxes";

export default class SyncNotionTicktickInboxes implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const { id, parent, source } = req.body.task as Task;
		let associatedTask: NotionInbox | TicktickTask;
		let task: NotionInbox | TicktickTask;

		if (source == "ticktick") {
			task = (await this.app.ticktick.getTask(id, parent))!;
			associatedTask = await this.app.notion.addToInbox(task.title);
		} else {
			task = (await this.app.notion.getInbox(id))!;
			associatedTask = await this.app.ticktick.addToInbox(task.title);
		}

		const syncedInboxes: SyncedInboxes = {
			notion:
				task.source == "notion"
					? task
					: (associatedTask as NotionInbox),
			ticktick:
				task.source == "ticktick"
					? task
					: (associatedTask as TicktickTask),
		};

		await this.app.db.addSyncedInboxes(syncedInboxes);

		res.send(
			`${associatedTask.source} => inbox item ${associatedTask.id} has been created `
		);
	}
}
