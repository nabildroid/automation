import IRoute from "../core/types/iroute";
import { Request, Response } from "express";
import INotion from "../repositories/contracts/iNotion";

interface Dependencies {
	readonly notion: INotion;
}
export default class World implements IRoute, Dependencies {
	readonly notion: INotion;

	constructor({ notion }: Dependencies) {
		this.notion = notion;
	}

	async handler(req: Request, res: Response) {
		const journal = await this.notion.createJournal();

		res.send("another route that uses notion #" + journal.id);
	}
}
