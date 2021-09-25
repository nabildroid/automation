import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class NewNotionInbox implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const note = (req.body.note as string).trim();
		const lines = note.split("\n");
		const title = lines.shift() as string;
		const body = lines.length ? lines.join("\n") : undefined;
		// todo add hashtags and MD5 to Notion childrens

		const { id } = await this.app.notion.addToInbox(title, body);

		res.send(
			`new note has been saved in your inbox at https://notion.so/${id}`
		);
	}
}
