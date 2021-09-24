import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import Ticktick from "../repositories/ticktick";

export default class AddCompletedTicktickTask implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const taskUrl = req.body.url as string;
		const { taskId, list } = Ticktick.parseTaskUrl(taskUrl);

		await this.app.db.addTask({
			id: taskId,
			parent: list,
			done: true,
			source: "ticktick",
		});

		res.send("task has been recorded");
	}
}
