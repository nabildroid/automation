import IRoute from "../core/types/iroute";
import { Request, Response } from "express";
import IApp from "../core/contract/iapp";

export default class World implements IRoute {
	readonly app: IApp;

	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const journal = await this.app.notion.createJournal();
		
		res.send("another route that uses notion #" + journal.id);
	}
}
