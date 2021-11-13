import Notion, { Config as NotionConfig } from "./repositories/notion";
import { Router } from "express";
import Firestore from "./repositories/firestore";
import Service from "../../core/service";
import NotionBlog from "./routes/notion_blog";
import ReportMode from "./routes/report_mode";
import SyncWithPocket from "./routes/sync_with_pocked";
import PocketClient from "../../services/pocket";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  firestore: FirebaseFirestore.Firestore;
  pocketClient:PocketClient;
};

export default class GeneralService extends Service {
  static route = Router();
  notion: Notion;
  db: Firestore;
  pocketClient:PocketClient;

  constructor(config: ServiceConfig) {
    super();

    this.notion = new Notion(config.notion.auth, config.notion.databases);
    this.db = new Firestore(config.firestore);
    this.pocketClient = config.pocketClient;

    this.initRoutes();
  }

  initRoutes() {
    const { route } = GeneralService;
    this.configRoutes(
      [
        ["get", "/blog", new NotionBlog(this.notion,this.db)],
        ["post", "/report", new ReportMode(this.db)],
        ["post", "/pocket/sync",new SyncWithPocket(this.db,this.pocketClient) ],
      ],
      route
    );
  }
}
