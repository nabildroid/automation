import { Router } from "express";
import Service from "../../core/service";
import TicktickClient from "../../services/ticktick";
import Notion, { Config as NotionConfig } from "./repositories/notion";
import Ticktick from "./repositories/ticktick";
import CompletedTaskJournal from "./routes/completed_task_journal";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  ticktickClient: TicktickClient;
};

export default class JournalService extends Service {
  static route = Router();
  notion: Notion;
  ticktick: Ticktick;

  constructor(config: ServiceConfig) {
    super();

    this.notion = new Notion(config.notion.auth, config.notion.databases);
    this.ticktick = new Ticktick(config.ticktickClient);
    this.initRoutes();
  }

  initRoutes() {
    const { route } = JournalService;
    this.configRoutes(
      [["post", "/", new CompletedTaskJournal(this.notion, this.ticktick)]],
      route
    );
  }
}
