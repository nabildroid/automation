import { RequestHandler } from "express";

const Hello: RequestHandler = (req, res) => {
	res.send("Hello World:)");
};
export default Hello;
