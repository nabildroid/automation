import { firestore } from "firebase-admin";
import Task from "../core/entities/task";
import task from "../core/entities/task";
import AppConfig from "../entities/app_config";
import IFirestore from "./contracts/iFirestore";

const CONFIG = "/general/config";
const TASKS = "/tasks";

export default class Firestore implements IFirestore {
	private readonly client: firestore.Firestore;
	constructor(client: firestore.Firestore) {
		this.client = client;
	}

	async getCompletedTasks(after?: Date) {
		let ref = this.client.collection(TASKS).where("done", "==", true);
		if (after) {
			ref = ref.where(
				"created",
				">=",
				firestore.Timestamp.fromDate(after)
			);
		}

		const query = await ref.get();

		return query.docs.map((d) => d.data()) as (task & { done: true })[];
	}

	async appConfig(): Promise<AppConfig> {
		const doc = await this.client.doc(CONFIG).get();
		const config = doc.data();
		if (config) {
			return this.validateConfig(config);
		} else {
			throw Error(
				`application configuration doesn't exists in the provided database, path(${CONFIG}) is empty`
			);
		}
	}

	getTasks(): Promise<task[]> {
		throw new Error("Method not implemented.");
	}

	async addTask(task: task): Promise<void> {
		const exists = await this.getTask(task.id);

		// FIXME is it goo to throw time here without information the rest of the system
		const taskWithTime = {
			...task,
			created: firestore.Timestamp.now(),
		};

		if (exists) {
			await this.client.doc(`${TASKS}/${exists.id}`).update(taskWithTime);
		} else {
			await this.client.collection(TASKS).add(taskWithTime);
		}
	}

	/**
	 *
	 * @param taskId it's not the document id, but rather a stored id withing the document it self
	 */
	private async getTask(taskId: string) {
		const ref = this.client.collection(TASKS).where("id", "==", taskId);
		const query = await ref.get();

		if (query.size) {
			return query.docs[0];
		}
	}

	private validateConfig(config: any): AppConfig {
		// todo validate and create a default configuration
		return config;
	}
}
