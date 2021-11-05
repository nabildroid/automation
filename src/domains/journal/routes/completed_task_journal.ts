import { Request, Response } from "express";
import { IRoute } from "../../../core/service";

import { yesterday } from "../../../core/utils";
import Notion from "../repositories/notion";
import Ticktick from "../repositories/ticktick";

export default class CompletedTaskJournal implements IRoute {
  notion: Notion;
  ticktick: Ticktick;
  constructor(notion: Notion, ticktick: Ticktick) {
    this.notion = notion;
    this.ticktick = ticktick;
  }

  async handler(_: Request, res: Response) {
    const completedTasks = await this.ticktick.getCompletedTasks(yesterday());

    if (completedTasks.length) {
      const { id } = await this.notion.addJournal(completedTasks);

      res.send(`notion journal page has been created https://notion.so/${id}`);
    } else {
      res.send(
        ":( you didn't complete any task today, you gota work harder tomorrow"
      );
    }
  }
}
