import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import PocketClient from "../../../services/pocket";
import FlashcardService from "../../flashcard";
import Firestore from "../repositories/firestore";

export default class SyncWithPocket implements IRoute {
  db: Firestore;
  pocket: PocketClient;

  constructor(db: Firestore, pocket: PocketClient) {
    this.db = db;
    this.pocket = pocket;
  }

  async handler(_: Request, res: Response) {
    const limit = 10;
    const checked = await this.db.pocketChecked();
    const since = Math.floor(checked.checked.getTime() / 1000);
    const allArticles = await this.pocket.getArticles(since);
    allArticles.sort((a, b) => a.updated.getTime() - b.updated.getTime());
    const articles = allArticles.slice(0, limit);
    if (!articles.length) return res.send("synced - empty");

    const newHighlightIds: string[] = [];
    const promises = articles.map(async (article) => {
      for (const item of article.highlights) {
        if (!checked.highlighIds.includes(item.id)) {
          FlashcardService.emit("notion.addFlashcard", {
            term: article.title,
            definition: item.text,
            tags: article.tags,
            from: "pocket",
            source: article.url,
          });

          newHighlightIds.push(item.id);
        }
      }
    });

    await Promise.all(promises);

    await this.db.savePocketArticle(articles.filter((a) => a.completed));
    await this.db.checkPocket({
      checked: articles.length == limit ? articles.pop()!.updated : new Date(),
      highlighIds: newHighlightIds,
    });

    return res.send("synced");
  }
}
