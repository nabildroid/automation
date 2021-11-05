import { Router } from "express";
import Service from "../../core/service";
import Notion, { Config as NotionConfig } from "./repositories/notion";
import Firestore from "./repositories/firestore";
import NewNotionInbox from "./routes/new_notion_inbox";
import SyncNotionTicktickInboxes from "./routes/sync_notion_ticktick_inboxes";
import UploadScreenshot from "./routes/upload_screenshot";
import Ticktick from "./repositories/ticktick";
import TicktickClient from "../../services/ticktick";
import { Bucket } from "@google-cloud/storage";
import Storage from "./repositories/storage";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  firestore: FirebaseFirestore.Firestore;
  ticktickClient: TicktickClient;
  bucket: Bucket;
};

export default class InboxService extends Service {
  static route = Router();
  notion: Notion;
  db: Firestore;
  ticktick: Ticktick;
  storage: Storage;

  constructor(config: ServiceConfig) {
    super();

    this.notion = new Notion(config.notion.auth, config.notion.databases);
    this.db = new Firestore(config.firestore);
    this.ticktick = new Ticktick(config.ticktickClient);
    this.storage = new Storage(config.bucket);

    this.initRoutes();
  }

  initRoutes() {
    const { route } = InboxService;
    this.configRoutes(
      [
        ["post", "/notion", new NewNotionInbox(this.notion)],
        [
          "post",
          "/sync",
          new SyncNotionTicktickInboxes(this.db, this.notion, this.ticktick),
        ],
        [
          "post",
          "/screenshot",
          new UploadScreenshot(this.notion, this.storage),
        ],
      ],
      route
    );
  }
}