import PocketCheck from "../../core/entities/pocket_check";
import Task from "../../core/entities/task";
import PocketArticle from "../../entities/pocket_article";
import SyncedInboxes from "../../domains/inbox/models/syncedInboxes";

export default interface IFirestore {
  updateRecentBlogDate(date: Date): Promise<void>;
  lastSeenBlogUpdate(): Promise<Date>;

  reportMode(mode: string): Promise<void>;

  pocketChecked(): Promise<PocketCheck>;
  checkPocket(check: PocketCheck): Promise<void>;

  savePocketArticle(article: PocketArticle[]): Promise<void>;
  getPocketArticles(after?: Date): Promise<PocketArticle[]>;
}
