import { Express } from "express";
import Hello from "./routes/hello";

export default class App {
	constructor(server: Express) {
		server.get("/", Hello);
	}

	init() {
		console.log("app is ready");
	}
}
