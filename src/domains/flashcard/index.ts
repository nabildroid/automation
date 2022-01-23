import Notion, { Config as NotionConfig } from "./repositories/notion";
import { Router } from "express";
import Flashcards from "./routes/flashcards";
import Firestore from "./repositories/firestore";
import Service from "../../core/service";
import SaveFlashcardsScore from "./routes/save_flashcards_score";
import SyncFlashcards from "./routes/sync_flashcards";
import syncOfflineFlashcards from "./routes/sync_offline_flashcards";
import Flashcard, { FlashcardProgress } from "./models/flashcard";
import winston from "winston";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  firestore: FirebaseFirestore.Firestore;
};

export default class FlashcardService extends Service {
  static route = Router();
  static logger?: winston.Logger;

  notion: Notion;
  db: Firestore;
  constructor(config: ServiceConfig) {
    super();

    this.notion = new Notion(config.notion.auth, config.notion.databases);
    this.db = new Firestore(config.firestore);

    this.initRoutes();
    this.initEvents();
  }

  initRoutes() {
    const { route, logger } = FlashcardService;
    this.configRoutes(
      [
        ["get", "/", new Flashcards(this.db)],
        ["post", "/score", new SaveFlashcardsScore(this.db)],
        ["post", "/sync", new SyncFlashcards(this.notion, this.db)],
        ["post", "/offline", new syncOfflineFlashcards(this.db)],
      ],
      route,
      logger
    );
  }

  initEvents() {
    this.listen<events, events["notion.addFlashcard"]>(
      "notion.addFlashcard",
      async (payload) => {
        await this.notion.addFlashcard(payload);
      }
    );
  }

  static emit<K extends keyof events>(type: K, payload: events[K]) {
    return Service.rawEmit(type as string, payload);
  }

  static fetch<T extends keyof awaitEvents>(type: T) {
    return Service.rawFetch<awaitEvents, keyof awaitEvents>(type);
  }
}


interface events {
  ["notion.addFlashcard"]: Flashcard;
}

interface awaitEvents {
  ["firestore.getTodayscore"]: FlashcardProgress[];
}
