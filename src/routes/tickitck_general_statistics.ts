import IRoute from "../core/types/iroute";

import { json, Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class TicktickGeneralStatistics implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(req: Request, res: Response) {
		const {
			level,
			score,
			todayCompleted,
			totalCompleted,
			yesterdayCompleted,
			scoreByDay,
			taskByDay,
		} = await this.app.ticktick.getGeneralStatistis();

		const response = {
			level,
			score,
			todayCompleted,
			totalCompleted,
			yesterdayCompleted,
			daysRow: Object.keys(scoreByDay).map(formatTime),
			scoreByDay:Object.values(scoreByDay),
			taskByDay:Object.values(taskByDay).map(v=>v.completeCount),
		};

        res.send(JSON.stringify(response));
	}
}

/** convert from 20210908 to 2021 09 08 */
function formatTime(str: string) {
	const year = str.slice(0, 4);
	const month = str.slice(4, 6);
	const day = str.slice(6);

	return new Date([year, month, day].join(" "));
}
