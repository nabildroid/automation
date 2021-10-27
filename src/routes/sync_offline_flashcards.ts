import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class syncOfflineFlashcards implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
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
      await this.app.db.updateFlashcard(card);
    }

    for (const p of progress) {
      await this.app.db.updateFlashcardProgress(
        p.flashcardId,
        new Date(p.updated),
        p
      );
    }

    for (const stat of stats) {
      await this.app.db.addFlashcardStatistic({
        ...stat,
        date: new Date(stat.updated),
      });
    }

    res.send("done");
  }
}
