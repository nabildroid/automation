import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class ReportMode implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const mode = req.body.mode;
		if (!mode) res.send("error");
		else {
			await this.app.db.reportMode(mode);

			res.send(`${mode} has been reported`);
		}
	}
}
