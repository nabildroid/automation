import IRoute from "../core/types/iroute";
import { Request, Response } from "express";
import IApp from "../core/contract/iapp";

export default class Hello implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	handler(req: Request, res: Response) {
		res.send("Hello World");
	}
}
