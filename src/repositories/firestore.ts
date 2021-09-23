import { firestore } from "firebase-admin";
import task from "../core/entities/task";
import app_config from "../entities/app_config";
import IFirestore from "./contracts/iFirestore";

export default class Firestore implements IFirestore {
	constructor(client: firestore.Firestore) {}
	appConfig(): Promise<app_config> {
		throw new Error("Method not implemented.");
	}
	getTasks(): Promise<task[]> {
		throw new Error("Method not implemented.");
	}
	addTask(task: task): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
