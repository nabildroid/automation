import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Ticktick from "../repositories/ticktick";

export default class GeneralStatistics implements IRoute {
  ticktick: Ticktick;
  constructor(ticktick: Ticktick) {
    this.ticktick = ticktick;
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
    } = await this.ticktick.getGeneralStatistis();

    const response = {
      level,
      score,
      todayCompleted,
      totalCompleted,
      yesterdayCompleted,

      week: Object.entries(scoreByDay).map(([key, val]) => ({
        date: key,
        score: val,
        tasks: taskByDay[key].completeCount,
      })),
    };

    res.send(JSON.stringify(response));
  }
}

