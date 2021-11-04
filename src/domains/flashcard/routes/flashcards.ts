import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Firestore from "../repositories/firestore";

export default class Flashcards implements IRoute {
  readonly db: Firestore;
  constructor(db: Firestore) {
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    const deleted_since = new Date((req.query["deleted"] as string) || -1);
    const cards_since = new Date((req.query["cards"] as string) || -1);
    const progress_since = new Date((req.query["progress"] as string) || -1);
    const special_since = new Date((req.query["special"] as string) || -1);
    const statistics_since = new Date(
      (req.query["statistics"] as string) || -1
    );
    const context_since = new Date(req.body.context);

    const updates = await this.db.getFlashcardUpdates({
      deleted_since,
      cards_since,
      progress_since,
      special_since,
      statistics_since,
    });

    res.send(JSON.stringify(updates));
  }
}
