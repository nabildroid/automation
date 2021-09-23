import IRoute from "../core/types/iroute";
import { Request, Response } from "express";
import INotion from "../repositories/contracts/iNotion";

interface Dependencies  {
	readonly notion:INotion;
}
export default class Hello implements IRoute,Dependencies {
	readonly notion: INotion;
	
	constructor({notion}:Dependencies){
		this.notion = notion;
	}

	handler(req: Request, res: Response) {
		res.send("Hello World");
	}
}
