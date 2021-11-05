import TicktickClient from "../../../services/ticktick";
import ticktick_task from "../models/ticktick_task";

export default class Ticktick {
	private readonly client: TicktickClient;

	constructor(client: TicktickClient) {
		this.client = client;
	}

	addToInbox(title: string, body?: string): Promise<ticktick_task> {
		throw new Error("Method not implemented.");
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

	
}
