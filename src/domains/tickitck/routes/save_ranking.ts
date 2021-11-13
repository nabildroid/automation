import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Firestore from "../repositories/firestore";
import Ticktick from "../repositories/ticktick";

export default class SaveRanking implements IRoute {
  ticktick: Ticktick;
  db: Firestore;
  constructor(ticktick: Ticktick, db: Firestore) {
    this.ticktick = ticktick;
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    const ranking = await this.ticktick.getTodayRanking();
    await this.db.addRanking(ranking);

    res.send("saved");
  }
}
