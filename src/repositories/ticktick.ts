import ticktick_task from "../entities/ticktick_task";
import TicktickClient from "../services/ticktick";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	private readonly client: TicktickClient;

	constructor(client: TicktickClient) {
		this.client = client;
	}

	async getTask(
		id: string,
		list: string
	): Promise<ticktick_task | undefined> {
		const { data, status } = await this.client.getTask(id, list);

		if (status != 200) {
			return undefined;
		} else {
			return {
				id: data.id,
				parent: data.projectId,
				title: data.title,
				done: data.status == 2,
				tags: data.tags || [],
				source: "ticktick",
			};
		}
	}

	static parseTaskUrl(url: string) {
		// todo check the url validity
		const parts = url.split("/");
		const taskId = parts.pop();
		parts.pop(); // == "tasks"
		const list = parts.pop();

		if (!taskId || !list) throw Error("Unvalide Ticktick Task Url");

		return {
			taskId,
			list,
		};
	}
}
