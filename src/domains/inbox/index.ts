import { Router } from "express";
import Service from "../../core/service";
import Notion, { Config as NotionConfig } from "./repositories/notion";
import Firestore from "./repositories/firestore";
import NewNotionInbox from "./routes/new_notion_inbox";
import SyncNotionTicktickInboxes from "./routes/sync_notion_ticktick_inboxes";
import UploadScreenshot from "./routes/upload_screenshot";
import Ticktick, { Config as TicktickConfig } from "./repositories/ticktick";
import TicktickClient from "../../services/ticktick";
import { Bucket } from "@google-cloud/storage";
import Storage from "./repositories/storage";
import NewInbox from "./routes/new_inbox";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  firestore: FirebaseFirestore.Firestore;
  tickitck: {
  ticktickClient: TicktickClient;
    projects: TicktickConfig;
  };
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
    this.ticktick = new Ticktick(
      config.tickitck.ticktickClient,
      config.tickitck.projects
    );
    this.storage = new Storage(config.bucket);

    this.initRoutes();
  }

  initRoutes() {
    const { route } = InboxService;
    this.configRoutes(
      [
        ["post", "/notion", new NewNotionInbox(this.notion)],
        ["post", "/", new NewInbox(this.db, this.notion, this.ticktick)],
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
