import Notion, { Config as NotionConfig } from "./repositories/notion";
import { Router } from "express";
import Flashcards from "./routes/flashcards";
import Firestore from "./repositories/firestore";
import Service from "../../core/service";
import SaveFlashcardsScore from "./routes/save_flashcards_score";
import SyncFlashcards from "./routes/sync_flashcards";
import syncOfflineFlashcards from "./routes/sync_offline_flashcards";
import { bus } from "../..";
import Flashcard from "./models/flashcard";

type ServiceConfig = {
  notion: { auth: string; databases: NotionConfig };
  firestore: FirebaseFirestore.Firestore;
};

export default class FlashcardService extends Service {
  static route = Router();
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
    const { route } = FlashcardService;
    this.configRoutes(
      [
        ["get", "/", new Flashcards(this.db)],
        ["post", "/score", new SaveFlashcardsScore(this.db)],
        ["post", "/sync", new SyncFlashcards(this.notion, this.db)],
        ["post", "/offline", new syncOfflineFlashcards(this.db)],
      ],
      route
    );
  }

  initEvents() {
    bus.addListener("notion.addFlashcard", async (payload) => {
      await this.notion.addFlashcard(payload);
    });
  }

  static emit<T extends FlashcardEvents>(
    type: T,
    payload: FlashcardEventPayloads[T]
  ) {
    bus.emit(type, payload);
  }
}

type FlashcardEvents = "notion.addFlashcard";

type FlashcardEventPayloads = {
  ["notion.addFlashcard"]: Flashcard;
};