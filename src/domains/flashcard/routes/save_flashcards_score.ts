import { Request, Response } from "express";

import { IRoute } from "../../../core/service";

import FlashcardScore, { FlashcardStatistics } from "../models/flashcard_score";
import Firestore from "../repositories/firestore";

export default class SaveFlashcardsScore implements IRoute {
  db: Firestore;
  constructor(db: Firestore) {
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    const score = {
      ...req.body,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
    } as FlashcardScore;

    const statistics = this.mergeScoreIntoStatistics(score);
    await this.db.addFlashcardScore(score);
    await this.db.addFlashcardStatistic(statistics);

    const promises = score.cards.map((card) =>
      this.db.updateFlashcardProgress(
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
