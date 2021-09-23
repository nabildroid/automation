import { Express } from "express";
import { firestore } from "firebase-admin";
import IRoute from "./core/types/iroute";
import AppConfig from "./entities/app_config";
import IFirestore from "./repositories/contracts/iFirestore";
import INotion from "./repositories/contracts/iNotion";
import ITicktick from "./repositories/contracts/iTicktick";
import Firestore from "./repositories/firestore";
import Notion from "./repositories/notion";
import Ticktick from "./repositories/ticktick";
import Hello from "./routes/hello";
import World from "./routes/world";

export default class App {
	db!: IFirestore;
	notion!: INotion;
	ticktick!: ITicktick;
	config!: AppConfig;

	constructor(server: Express) {
		const hello: IRoute = new Hello(this);
		const world: IRoute = new World(this);

		server.get("/", hello.handler);
		server.get("/world", world.handler);
	}

	async init(firestore: firestore.Firestore) {
		this.db = new Firestore(firestore);
		this.config = await this.db.appConfig();
		this.notion = new Notion(this.config.auth.notion);
		this.ticktick = new Ticktick(this.config.auth.ticktick);

		console.log(`#${this.config.title} has been initiated`);
	}
}
