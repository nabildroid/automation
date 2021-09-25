import axios, { AxiosInstance } from "axios";
import ticktick_task from "../entities/ticktick_task";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	private readonly client: AxiosInstance;

	constructor(auth: string) {
		this.client = axios.create({
			baseURL: "https://api.ticktick.com",
			headers: {
				Authorization: `bearer ${auth}`,
			},
		});
	}

	async getTask(id: string, list: string): Promise<ticktick_task> {
		const endpoint = `/open/v1/project/${list}/task/${id}`;
		const { data, status } = await this.client.get(endpoint);

		if (status != 200) {
			throw Error("unable to get task URL:" + endpoint);
		} else {
			return {
				id: data.id,
				parent: data.projectId,
				title: data.title,
				done: data.status == 2,
				tags: [], // todo ticktick doesn't support returning tags
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
