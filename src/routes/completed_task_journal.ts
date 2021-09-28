import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import Task from "../core/entities/task";
import { setTodayUTCHour, today, yesterday } from "../core/utils";
import TicktickTask from "../entities/ticktick_task";

export default class CompletedTaskJournal implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(_: Request, res: Response) {
		const completedTasks = await this.app.ticktick.getCompletedTasks(
			yesterday()
		);

		if (completedTasks.length) {
			const { id } = await this.app.notion.addJournal(completedTasks);

			res.send(
				`notion journal page has been created https://notion.so/${id}`
			);
		} else {
			res.send(
				":( you didn't complete any task today, you gota work harder tomorrow"
			);
		}
	}

	private async tasksToTicktickTasks(tasks: Task[]) {
		const conversion = tasks.map((task) =>
			this.app.ticktick.getTask(task.id, task.parent)
		);

		const tickticktasks = await Promise.all(conversion);

		return tickticktasks.filter((item): item is TicktickTask => !!item);
	}
}
