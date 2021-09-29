import TicktickGeneralStats from "../entities/ticktick_general_stats";
import ticktick_task from "../entities/ticktick_task";
import TicktickClient from "../services/ticktick";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	private readonly client: TicktickClient;

	constructor(client: TicktickClient) {
		this.client = client;
	}

	async getGeneralStatistis(): Promise<TicktickGeneralStats> {
		const { data, status } = await this.client.getGeneralStatistics();
		if (status == 200) {
			return {
				level: data.level,
				score: data.score,
				todayCompleted: data.todayCompleted,
				yesterdayCompleted: data.yesterdayCompleted,
				totalCompleted: data.totalCompleted,
				scoreByDay: data.scoreByDay,
				taskByDay: data.taskByDay,
			};
		} else throw Error("unable to fetch ticktick general statistics");
	}
	async getCompletedTasks(after: Date): Promise<ticktick_task[]> {
		const { data, status } = await this.client.getAllCompletedTasks(after);
		if (status == 200) {
			return (data as any[]).map((item) => ({
				id: item.id,
				done: item.status == 2,
				source: "ticktick",
				parent: item.projectId,
				tags: item.tags || [],
				title: item.title,
			})).filter(d=>d.done) as ticktick_task[]
		} else return [];
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
