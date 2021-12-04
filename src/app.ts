import { Express } from "express";
import { Bucket } from "@google-cloud/storage";

import AppConfig from "./core/entities/app_config";
import TicktickClient from "./services/ticktick";
import PocketClient from "./services/pocket";
import FlashcardService from "./domains/flashcard";
import InboxService from "./domains/inbox";
import JournalService from "./domains/journal";
import Firestore from "./core/repositories/firestore";
import GeneralService from "./domains/general";
import TicktickService from "./domains/tickitck";
import TwitterClient from "./services/twitter";
import winston from "winston";

export default class App {
  private config!: AppConfig;
  db!: Firestore;

  constructor(server: Express, logging: winston.Logger) {
    server.use("/flashcard", FlashcardService.route);
    server.use("/inbox", InboxService.route);
    server.use("/journal", JournalService.route);
    server.use("/general", GeneralService.route);
    server.use("/ticktick", TicktickService.route);

    FlashcardService.logger = logging.child({ domain: "flashcard" });
    InboxService.logger = logging.child({ domain: "inbox" });
    JournalService.logger = logging.child({ domain: "journal" });
    GeneralService.logger = logging.child({ domain: "general" });
    TicktickService.logger = logging.child({ domain: "tictick" });
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

    const twitterClient = new TwitterClient(this.config.auth.twitter);

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
      tickitck: {
        ticktickClient: ticktickClient,
        projects: this.config.ticktickConfig,
      },
      notion: {
        auth: this.config.auth.notion,
        databases: {
          inbox: this.config.notionConfig.inbox,
        },
      },
      twitter: twitterClient,
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
      firestore: firestore,
      pocketClient: pocketClient,
    });

    new TicktickService({
      firestore: firestore,
      ticktick: ticktickClient,
    });

    console.log(`#${this.config.title} has been initiated`);
  }
}
