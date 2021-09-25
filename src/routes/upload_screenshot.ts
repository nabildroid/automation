import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class uploadScreenshot implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		// todo add check the url
		const url = req.body.url;
		const { id } = await this.app.notion.addScreenshotToInbox(url);

		res.send(
			`screenshot has been saved in notion inbox at https://notion.so/${id}`
		);
	}
}
