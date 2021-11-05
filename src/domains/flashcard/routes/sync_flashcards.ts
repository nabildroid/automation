import { Request, Response } from "express";
import { IRoute } from "../../../core/service";

import NotionFlashcard from "../models/notion_flashcard";
import StoredFlashcard from "../models/storedFlashcard";
import Firestore from "../repositories/firestore";
import Notion from "../repositories/notion";

export default class SyncFlashcards implements IRoute {
  notion: Notion;
  db: Firestore;
  constructor(notion: Notion, db: Firestore) {
    this.notion = notion;
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    const notionFlashcards = await this.notion.getFlashcards();
    const storedFlashcards = await this.db.getFlashcards();

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
      ...newCards.map((flashcard) => this.db.addFlashcard(flashcard)),
      ...updatedCards.map((flashcard) => this.db.updateFlashcard(flashcard)),
      ...removedFlashcardIds.map((id) => this.db.removeFlashcard(id))
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
