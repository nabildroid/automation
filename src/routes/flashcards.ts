import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class Flashcards implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const deleted_since = new Date((req.query["deleted"] as string) || -1);
    const cards_since = new Date((req.query["cards"] as string) || -1);
    const progress_since = new Date((req.query["progress"] as string) || -1);
    const special_since = new Date((req.query["special"] as string) || -1);
    const statistics_since = new Date(
      (req.query["statistics"] as string) || -1
    );
    // const context_since = new Date(req.body.context);

    const updates = await this.app.db.getFlashcardUpdates({
      deleted_since,
      cards_since,
      progress_since,
      special_since,
      statistics_since,
    });

    res.send(JSON.stringify(updates));
  }
}
