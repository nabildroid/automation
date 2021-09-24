import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import TicktickTask from "../entities/ticktick_task";

export default class CompletedTaskJournal implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(_: Request, res: Response) {
		// todo it should be sense 6AM for example
		const afterYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const allCompletedTasks = await this.app.db.getCompletedTasks(
			afterYesterday
		);

		const claimedTicktickCompleted = allCompletedTasks.filter(
			(t) => t.source == "ticktick"
		) as TicktickTask[];
		const tasks = await this.isItReallyCompleted(claimedTicktickCompleted);
		
		const { id } = await this.app.notion.createJournal(tasks);

		res.send(
			`notion journal page has been created https://notion.so/${id}`
		);
	}

	/** this endpoint is used by IFTTT & its doesn't dispatch re-opened tasks, in case the use had change his mind and re-opened the task */
	private async isItReallyCompleted(tasks: TicktickTask[]) {
		let completedTasks: TicktickTask[] = [];

		for (const task of tasks) {
			const realTask = await this.app.ticktick.getTask(
				task.id,
				task.parent
			);
			if (realTask.done == true) {
				completedTasks.push(task);
			}
		}

		return completedTasks;
	}
}
