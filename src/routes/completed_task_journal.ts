import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import Task from "../core/entities/task";
import { setTodayUTCHour } from "../core/utils";

export default class CompletedTaskJournal implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(_: Request, res: Response) {
		const allCompletedTasks = await this.app.db.getCompletedTasks(
			setTodayUTCHour(5)
		);

		const onlyTicktickTasks = allCompletedTasks.filter(
			(t) => t.source == "ticktick"
		);

		const claimedCompletedTasks = await this.tasksToTicktickTasks(
			onlyTicktickTasks
		);

		// this endpoint is used by IFTTT & its doesn't dispatch re-opened tasks, in case the use had change his mind and re-opened the task
		const completedTasks = claimedCompletedTasks.filter(
			(task) => task.done
		);

		const { id } = await this.app.notion.addJournal(completedTasks);

		res.send(
			`notion journal page has been created https://notion.so/${id}`
		);
	}

	private async tasksToTicktickTasks(tasks: Task[]) {
		const conversion = tasks.map((task) =>
			this.app.ticktick.getTask(task.id, task.parent)
		);
		return await Promise.all(conversion);
	}

	
}
