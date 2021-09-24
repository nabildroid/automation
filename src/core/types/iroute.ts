import { Response, Request } from "express";
import IApp from "../contract/iapp";

export default interface IRoute {
	readonly app: IApp;
	handler: (req: Request, res: Response) => void;
}
