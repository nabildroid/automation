import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Firestore from "../repositories/firestore";

export default class syncOfflineFlashcards implements IRoute {
  db: Firestore;
  constructor(db: Firestore) {
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    // todo fix typing here !
    const flashcards = (req.body.cards || []) as {
      id: string;
      updated: string;
      term: string;
      tags: string[];
      definition: string;
    }[];

    const progress = (req.body.progress || []) as {
      flashcardId: string;
      updated: string;
      ease: number;
      interval: number;
      repetitions: number;
    }[];

    const stats = (req.body.statistics || []) as {
      states: { [key: number]: number };
      updated: string;
    }[];

    for (const card of flashcards) {
      // todo refactor this
      await this.db.updateFlashcard(card as any);
    }

    for (const p of progress) {
      await this.db.updateFlashcardProgress(
        p.flashcardId,
        new Date(p.updated),
        p
      );
    }

    for (const stat of stats) {
      await this.db.addFlashcardStatistic({
        ...stat,
        date: new Date(stat.updated),
      });
    }

    res.send("done");
  }
}
