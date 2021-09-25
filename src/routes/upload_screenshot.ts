import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import { downloadFile } from "../core/utils";

export default class uploadScreenshot implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		// todo add check the url
		const url = req.body.url;

		
		const tempFileName = "temp-screenshot";
		const removeLocalFile = await downloadFile(url,tempFileName);
		const publicUrl = await this.app.storage.addScreenshot(tempFileName);

		removeLocalFile();

		const { id } = await this.app.notion.addScreenshotToInbox(publicUrl);

		res.send(
			`screenshot ${publicUrl} has been saved in notion inbox at https://notion.so/${id}`
		);
	}
}
