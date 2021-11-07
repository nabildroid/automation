import TicktickClient from "../../../services/ticktick";
import ticktick_task from "../../../core/entities/ticktick_task";
import { TaskContent } from "../../../core/entities/task";

export default class Ticktick {
	private readonly client: TicktickClient;

	constructor(client: TicktickClient) {
		this.client = client;
	}

  async addToInbox(content: TaskContent): Promise<ticktick_task> {
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
