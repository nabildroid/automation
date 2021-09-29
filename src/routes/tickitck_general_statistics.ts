import IRoute from "../core/types/iroute";

import { json, Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class TicktickGeneralStatistics implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		res.send(JSON.stringify(await this.app.ticktick.getGeneralStatistis()));
	}
}
