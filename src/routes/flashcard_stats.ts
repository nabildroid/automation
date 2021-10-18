import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import FlashcardScore, {
  FlashcardStatistics,
} from "../core/entities/flashcard_score";

export default class FlashcardStats implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(_: Request, res: Response) {
    const scores = await this.app.db.getFlashcardsScores();
    const groupedByDate = Object.values(this.groupScoreByDate(scores));

    const summedScores =  this.sumScore(groupedByDate);

    res.send(JSON.stringify(summedScores));
  }

  sumScore(scores: FlashcardScore[][]): FlashcardStatistics[] {
    return scores.map((values) => {
      return values.reduce((acc, v) => {
        if (!acc["date"]) {
          acc["date"] = v.startTime;
        }
        if(!acc["states"]){
          acc["states"] = {};
        }
        v.cards.forEach((card) => {
          acc["states"][card.state] = (acc["states"][card.state] || 0) + 1;
        });

        return acc;
      }, {} as FlashcardStatistics);
    });
  }

  groupScoreByDate(scores: FlashcardScore[]) {
    return scores.reduce<{ [key: string]: FlashcardScore[] }>((acc, v) => {
      const i = v.startTime.toDateString();
      if (!acc[i]) {
        acc[i] = [];
      }

      acc[i].push(v);
      return acc;
    }, {});
  }
}
