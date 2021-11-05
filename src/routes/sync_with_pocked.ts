import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";
import FlashcardService from "../domains/flashcard";

export default class SyncWithPocket implements IRoute {
  readonly app: IApp;
  constructor(app: IApp) {
    this.app = app;
  }

  async handler(_: Request, res: Response) {
    const limit = 10;
    const checked = await this.app.db.pocketChecked();
    const since = Math.floor(checked.checked.getTime() / 1000);
    const allArticles = await this.app.pocket.getArticles(since);
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

    await this.app.db.savePocketArticle(articles.filter((a) => a.completed));
    await this.app.db.checkPocket({
      checked: articles.length == limit ? articles.pop()!.updated : new Date(),
      highlighIds: newHighlightIds,
    });

    return res.send("synced");
  }
}
