import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Ticktick from "../repositories/ticktick";

export default class TodayList implements IRoute {
  ticktick: Ticktick;
  constructor(ticktick: Ticktick) {
    this.ticktick = ticktick;
  }

  async handler(req: Request, res: Response) {
    const tasks = await this.ticktick.getDefaultTasks();

    res.json(tasks);
  }
}
