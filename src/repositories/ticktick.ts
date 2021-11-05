import TicktickGeneralStats from "../entities/ticktick_general_stats";
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
	
}
