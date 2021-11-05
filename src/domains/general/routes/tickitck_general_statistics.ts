import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Ticktick from "../repositories/ticktick";

export default class TicktickGeneralStatistics implements IRoute {
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

/** convert from 20210908 to 2021 09 08 */
function formatTime(str: string) {
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6);

  return new Date([year, month, day].join(" "));
}
