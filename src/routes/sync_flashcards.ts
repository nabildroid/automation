import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import NotionFlashcard from "../entities/notion_flashcard";
import StoredFlashcard from "../entities/storedFlashcard";

export default class SyncFlashcards implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(req: Request, res: Response) {
    const notionFlashcards = await this.app.notion.getFlashcards();
    const storedFlashcards = await this.app.db.getFlashcards();

    const promises = [];

    const newCards = this.getNewFlashcards(notionFlashcards, storedFlashcards);
    const removedFlashcardIds = this.getRemovedFlashcardIds(
      notionFlashcards,
      storedFlashcards
    );
    const updatedCards = this.getUpdatedFlashcards(
      notionFlashcards,
      storedFlashcards
    );
    promises.push(
      ...newCards.map((flashcard) => this.app.db.addFlashcard(flashcard)),
      ...updatedCards.map((flashcard) =>
        this.app.db.updateFlashcard(flashcard)
      ),
      ...removedFlashcardIds.map((id) => this.app.db.removeFlashcard(id))
    );

    await Promise.all(promises);
    res.send("synced");
  }

  getNewFlashcards(
    notion: NotionFlashcard[],
    stored: StoredFlashcard[]
  ): NotionFlashcard[] {
    return notion.filter((n) => {
      return !stored.some((s) => s.notionId == n.id);
    });
  }

  getUpdatedFlashcards(
    notion: NotionFlashcard[],
    stored: StoredFlashcard[]
  ): NotionFlashcard[] {
    const updated: NotionFlashcard[] = [];

    notion.forEach((n) => {
      const s = stored.find(
        (e) =>
          e.notionId == n.id &&
          e.updated.toISOString() != n.edited.toISOString()
      );
      if (!s) return;
      updated.push(n);
    });

    return updated;
  }

  getRemovedFlashcardIds(
    notion: NotionFlashcard[],
    stored: StoredFlashcard[]
  ): string[] {
    return stored
      .filter((s) => {
        return !notion.some((e) => e.id == s.notionId);
      })
      .map((e) => e.id);
  }
}
