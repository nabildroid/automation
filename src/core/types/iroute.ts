import { Response, Request } from "express";

export default interface IRoute {
	handler: (req: Request, res: Response) => void;
}
