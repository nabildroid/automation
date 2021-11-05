import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Firestore from "../repositories/firestore";

export default class ReportMode implements IRoute {
	db:Firestore;
	constructor(db:Firestore) {
		this.db = db;
	}

	async handler(req: Request, res: Response) {
		const mode = req.body.mode;
		if (!mode) res.send("error");
		else {
			await this.db.reportMode(mode);

			res.send(`${mode} has been reported`);
		}
	}
}
