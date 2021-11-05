import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import { downloadFile } from "../../../core/utils";
import Notion from "../repositories/notion";
import Storage from "../repositories/storage";

export default class uploadScreenshot implements IRoute {
	notion:Notion;
	storage:Storage;
	
	constructor(notion:Notion,storage:Storage) {
		this.notion = notion;
		this.storage = storage;
	}	

	async handler(req: Request, res: Response) {
		// todo add check the url
		const url = req.body.url;

		
		const tempFileName = "temp-screenshot" + Math.random();
		const removeLocalFile = await downloadFile(url,tempFileName);
		const publicUrl = await this.storage.addScreenshot(tempFileName);

		removeLocalFile();

		const { id } = await this.notion.addScreenshotToInbox(publicUrl);

		res.send(
			`screenshot ${publicUrl} has been saved in notion inbox at https://notion.so/${id}`
		);
	}
}
