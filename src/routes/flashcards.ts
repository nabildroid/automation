import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class Flashcards implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(_: Request, res: Response) {
    const flashcards = await this.app.db.getFlashcards();

    res.send(JSON.stringify(flashcards));
  }
}
