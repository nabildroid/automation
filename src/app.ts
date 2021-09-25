import { Express } from "express";
import { Bucket } from "@google-cloud/storage";

import IApp from "./core/contract/iapp";
import IRoute from "./core/types/iroute";
import AppConfig from "./entities/app_config";
import IFirestore from "./repositories/contracts/iFirestore";
import INotion from "./repositories/contracts/iNotion";
import ITicktick from "./repositories/contracts/iTicktick";
import Firestore from "./repositories/firestore";
import Notion from "./repositories/notion";
import Ticktick from "./repositories/ticktick";
import AddCompletedTicktickTask from "./routes/add_completed_todoist_task";
import CompletedTaskJournal from "./routes/completed_task_journal";
import uploadScreenshot from "./routes/upload_screenshot";
import IStorage from "./repositories/contracts/IStorage";
import Storage from "./repositories/storage";

type RouteConfig = [method: "get" | "post", path: string, route: IRoute];

export default class App implements IApp {
	db!: IFirestore;
	notion!: INotion;
	storage!: IStorage;
	ticktick!: ITicktick;
	private config!: AppConfig;

	constructor(server: Express) {
		this.configRoutes(server, [
			["post", "/completedtaskjournal", new CompletedTaskJournal(this)],
			["post", "/uploadScreenshot", new uploadScreenshot(this)],
			[
				"post",
				"/addCompletedTodoistTask",
				new AddCompletedTicktickTask(this),
			],
		]);
	}

	private configRoutes(server: Express, routes: RouteConfig[]) {
		routes.forEach((route) => {
			const handler = route[2].handler.bind(route[2]);
			if (route[0] == "get") {
				server.get(route[1], handler);
			} else if (route[0] == "post") {
				server.post(route[1], handler);
			}
		});
	}

	async init(firestore: FirebaseFirestore.Firestore, bucket: Bucket) {
		this.db = new Firestore(firestore);
		this.config = await this.db.appConfig();
		this.notion = new Notion(
			this.config.auth.notion,
			this.config.notionConfig
		);
		this.storage = new Storage(bucket);
		this.ticktick = new Ticktick(this.config.auth.ticktick);

		console.log(`#${this.config.title} has been initiated`);
	}
}
