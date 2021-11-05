import { Express } from "express";
import { Bucket } from "@google-cloud/storage";

import IApp from "./core/contract/iapp";
import IRoute from "./core/types/iroute";
import AppConfig from "./core/entities/app_config";
import IFirestore from "./repositories/contracts/iFirestore";
import INotion from "./repositories/contracts/iNotion";
import ITicktick from "./repositories/contracts/iTicktick";
import Firestore from "./repositories/firestore";
import TempFirestore from "./core/repositories/firestore";
import Notion from "./repositories/notion";
import Ticktick from "./repositories/ticktick";
import IStorage from "./repositories/contracts/IStorage";
import Storage from "./repositories/storage";
import TicktickClient from "./services/ticktick";
import TicktickGeneralStatistics from "./routes/tickitck_general_statistics";
import NotionBlog from "./routes/notion_blog";
import ReportMode from "./routes/report_mode";
import PocketClient from "./services/pocket";
import SyncWithPocket from "./routes/sync_with_pocked";
import FlashcardService from "./domains/flashcard";
import InboxService from "./domains/inbox";
import JournalService from "./domains/journal";

type RouteConfig = [method: "get" | "post", path: string, route: IRoute];

export default class App implements IApp {
  db!: IFirestore;
  notion!: INotion;
  storage!: IStorage;
  ticktick!: ITicktick;
  pocket!: PocketClient;
  private config!: AppConfig;

  constructor(server: Express) {
    server.use("/flashcard", FlashcardService.route);
    server.use("/inbox", InboxService.route);
    server.use("/journal", JournalService.route);

    this.configRoutes(server, [
      ["post", "/report", new ReportMode(this)],

      ["get", "/ticktickstats", new TicktickGeneralStatistics(this)],
      ["get", "/techBlog", new NotionBlog(this)],
      ["get", "/syncWithPocket", new SyncWithPocket(this)],
    ]);
  }

  private configRoutes(server: Express, routes: RouteConfig[]) {
    routes.forEach((route) => {
      const handler = route[2].handler.bind(route[2]);
      if (route[0] == "get") {
        server.get(route[1], handler);
      } else if (route[0] == "post") {
        server.post(route[1], handler);
      }
    });
  }

  async init(firestore: FirebaseFirestore.Firestore, bucket: Bucket) {
    this.db = new Firestore(firestore);

    // todo refacor this
    const tempDB = new TempFirestore(firestore);
    this.config = await tempDB.appConfig();

    new FlashcardService({
      firestore,
      notion: {
        auth: this.config.auth.notion,
        databases: {
          flashcard: this.config.notionConfig.flashcard,
        },
      },
    });

    this.notion = new Notion(this.config.auth.notion, this.config.notionConfig);
    this.storage = new Storage(bucket);
    this.pocket = new PocketClient(this.config.auth.pocket);

    const ticktickClient = new TicktickClient(
      this.config.ticktickConfig.email,
      this.config.ticktickConfig.password,
      tempDB.updateTicktickAuth.bind(this.db),
      {
        auth: this.config.auth.ticktick,
      }
    );

    new InboxService({
      bucket: bucket,
      firestore: firestore,
      ticktickClient: ticktickClient,
      notion: {
        auth: this.config.auth.notion,
        databases: {
          inbox: this.config.notionConfig.inbox,
        },
      },
    });

    new JournalService({
      notion: {
        auth: this.config.auth.notion,
        databases: {
          journal: this.config.notionConfig.journal,
        },
      },
      ticktickClient: ticktickClient,
    });

    this.ticktick = new Ticktick(ticktickClient);

    console.log(`#${this.config.title} has been initiated`);
  }
}
