import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import FlashcardScore, {
  FlashcardStatistics,
} from "../core/entities/flashcard_score";

export default class SaveFlashcardsScore implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const score = {
      ...req.body,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
    } as FlashcardScore;

    const statistics = this.mergeScoreIntoStatistics(score);
    await this.app.db.addFlashcardScore(score, statistics);
    const promises = score.cards.map((card) =>
      this.app.db.updateFlashcardProgress(
        card.id,
        new Date(card.time),
        card.progress
      )
    );

    await Promise.all(promises);

    res.send("Updated");
  }

  mergeScoreIntoStatistics(score: FlashcardScore): FlashcardStatistics {
    const { startTime } = score;

    const states = score.cards.reduce((acc, v) => {
      acc[v.state] = (acc[v.state] || 0) + 1;

      return acc;
    }, {} as { [key: number]: number });

    return {
      states,
      date: startTime,
    };
  }
}
