import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Ticktick from "../repositories/ticktick";

export default class AddPomodoro implements IRoute {
  ticktick: Ticktick;
  constructor(ticktick: Ticktick) {
    this.ticktick = ticktick;
  }

  async handler(req: Request, res: Response) {
    const { id, project, duration } = req.body;

    await this.ticktick.addPomodoroTask(id, project, duration);

    res.send("done");
  }
}
