import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import FlashcardScore from "../core/entities/flashcard_score";

export default class SaveFlashcardsScore implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const score = req.body.score as FlashcardScore;

    await this.app.db.addFlashcardScore(score);
    const promises = score.cards.map((card) =>
      this.app.db.updateFlashcardProgress(card.id, card.progress)
    );

    await Promise.all(promises);

    res.send("Updated");
  }
}
