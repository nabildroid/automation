import IRoute from "../core/types/iroute";
import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class UpdateSpecialFlashcard implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const id = req.body.id as string;
    const boosted = req.body.boosted as boolean;

    await this.app.db.updateSpecialFlashcard(id, boosted);

    res.send(boosted ? "boosted" : "unboosted hhh");
  }
}
