import { Express } from "express";
import { Bucket } from "@google-cloud/storage";

import AppConfig from "./core/entities/app_config";
import TempFirestore from "./core/repositories/firestore";
import TicktickClient from "./services/ticktick";
import PocketClient from "./services/pocket";
import FlashcardService from "./domains/flashcard";
import InboxService from "./domains/inbox";
import JournalService from "./domains/journal";
import Firestore from "./core/repositories/firestore";
import GeneralService from "./domains/general";

export default class App {
  private config!: AppConfig;
  db!: Firestore;

  constructor(server: Express) {
    server.use("/flashcard", FlashcardService.route);
    server.use("/inbox", InboxService.route);
    server.use("/journal", JournalService.route);
    server.use("/general", GeneralService.route);
  }

  async init(firestore: FirebaseFirestore.Firestore, bucket: Bucket) {
    this.db = new Firestore(firestore);
    this.config = await this.db.appConfig();

    const pocketClient = new PocketClient(this.config.auth.pocket);

    const ticktickClient = new TicktickClient(
      this.config.ticktickConfig.email,
      this.config.ticktickConfig.password,
      this.db.updateTicktickAuth.bind(this.db),
      {
        auth: this.config.auth.ticktick,
      }
    );

    new FlashcardService({
      firestore,
      notion: {
        auth: this.config.auth.notion,
        databases: {
          flashcard: this.config.notionConfig.flashcard,
        },
      },
    });

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

    new GeneralService({
      notion: {
        auth: this.config.auth.notion,
        databases: {
          blog: this.config.notionConfig.blog,
        },
      },
      ticktickClient: ticktickClient,
      firestore: firestore,
      pocketClient: pocketClient,
    });
    console.log(`#${this.config.title} has been initiated`);
  }
}
