import IRoute from "../core/types/iroute";
import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import { FlashcardSpecial } from "../core/entities/flashcard";

export default class UpdateSpecialFlashcard implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const id = req.body.id as string;
    const attributes = req.body.attributes as FlashcardSpecial;
    const date = new Date(req.body.date);

    await this.app.db.updateSpecialFlashcard(id, attributes,date);

    res.send("updated");
  }
}
