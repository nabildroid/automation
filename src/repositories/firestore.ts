import { firestore } from "firebase-admin";
import {
  FlashcardProgress,
  FlashcardSpecial,
} from "../core/entities/flashcard";
import flashcard_score, {
  FlashcardStatistics,
} from "../core/entities/flashcard_score";
import PocketCheck from "../core/entities/pocket_check";
import Task from "../core/entities/task";
import task from "../core/entities/task";
import { mergeFlashcardStatistics } from "../core/utils";
import AppConfig from "../entities/app_config";
import NotionFlashcard from "../entities/notion_flashcard";
import pocket_article from "../entities/pocket_article";
import StoredFlashcard, {
  StoredFlashcardProgress,
  StoredFlashcardSpecial,
  StoredFlashcardStatistics,
} from "../entities/storedFlashcard";
import syncedInboxes from "../entities/syncedInboxes";
import IFirestore, {
  FlashcardUpdates,
  getFlashcardsParams,
} from "./contracts/iFirestore";

const CONFIG = "/general/config";
const TASKS = "/tasks";
const SYNCEDINBOXES = "/synced_inboxes";
const BLOG = "/blog/last_update";
const MODE = "/mode/";

const FLASHCARD = "/flashcards/";
const FLASHCARD_SCORE = "/flashcard_score";
const FLASHCARD_PROGRESS = "/flashcard_progress";
const FLASHCARD_SPECIAL = "/flashcard_special";
const FLASHCARD_STATISTICS = "/flashcard_statistics";

const POCKET = "/general/pocket";
const POCKET_ARTICLES = "/pocket_articles";

export default class Firestore implements IFirestore {
	private readonly client: firestore.Firestore;
	constructor(client: firestore.Firestore) {
		this.client = client;
	}

  async pocketChecked(): Promise<PocketCheck> {
    const query = await this.client.doc(POCKET).get();
    const data = query.data();
    if (data) {
      return {
        checked: data.checked.toDate(),
        highlighIds: data.highlighIds,
      };
    } else
      return {
        checked: new Date(-1),
        highlighIds: [],
      };
  }

  async checkPocket(check: PocketCheck): Promise<void> {
    await this.client.doc(POCKET).update({
      checked: check.checked,
      highlighIds: check.highlighIds.length
        ? firestore.FieldValue.arrayUnion(...check.highlighIds)
        : [],
    });
  }

  async savePocketArticle(articles: pocket_article[]): Promise<void> {
    for (const arcticle of articles) {
      
      await this.client
        .collection(POCKET_ARTICLES)
        .doc(arcticle.id)
        .set({
          ...arcticle,
          created: firestore.Timestamp.fromDate(arcticle.created),
          updated: firestore.Timestamp.fromDate(arcticle.updated),
          read: arcticle.read
            ? firestore.Timestamp.fromDate(arcticle.read)
            : null,
          highlights: arcticle.highlights.map((h) => ({
            ...h,
            created: firestore.Timestamp.fromDate(h.created),
          })),
        });
    }
  }

  async getPocketArticles(after?: Date): Promise<pocket_article[]> {
    let query = await this.client
      .collection(POCKET_ARTICLES)
      .where("read", ">=", firestore.Timestamp.fromDate(after || new Date(-1)))
      .get();

    if (query.empty) return [];

    return query.docs.map((doc) => {
      const data = doc as any;
      return {
        updated: data.updated.toDate(),
        created: data.completed.toDate(),
        read: data.read?.toDate(),

        highlights: (data.highlights as any[]).map((h) => ({
          ...h,
          created: h.created.toDate(),
        })),
      } as pocket_article;
    });
  }

  async getFlashcards(): Promise<StoredFlashcard[]> {
    const flashcards = await this.client.collection(FLASHCARD).get();

    const list = flashcards.docs
      .map<any>((d) => ({ ...d.data(), id: d.id }))
      .map((d) => ({
        ...d,
        created: d.created.toDate(),
        updated: d.updated.toDate(),
      }));

    return list as StoredFlashcard[];
  }

  async getFlashcardsScores(): Promise<flashcard_score[]> {
    const query = await this.client.collection(FLASHCARD_SCORE).get();
    return query.docs.map((doc) => {
      const data = doc.data();
      console.log(data);
      return {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        cards: (data.cards as any[]).map((d) => ({
          ...d,
          time: new Date(d.time),
        })),
      };
    });
  }
	
  async updateSpecialFlashcard(
    id: string,
    content: FlashcardSpecial,
    date: Date
  ): Promise<void> {
    await this.client
      .collection(FLASHCARD_SPECIAL)
      .doc(id)
      .set({
        // might create an error because the doc is not yet created!
        ...content,
        updated: firestore.Timestamp.fromDate(date),
    });
  }

  async addFlashcardScore(
    score: flashcard_score,
    statistics: FlashcardStatistics
  ): Promise<void> {
    const query = await this.client
      .collection(FLASHCARD_STATISTICS)
      .where(
        "updated",
        ">=",
        firestore.Timestamp.fromDate(new Date(new Date().toDateString()))
      )
      .limit(1)
      .get();

    if (query.empty) {
      await this.client.collection(FLASHCARD_STATISTICS).add({
        ...statistics,
        updated: firestore.Timestamp.fromDate(statistics.date),
      });
    } else {
      const doc = query.docs[0];
      const merged = mergeFlashcardStatistics(doc.data() as any, statistics);

      await this.client
        .collection(FLASHCARD_STATISTICS)
        .doc(doc.id)
        .set({
          ...merged,
          updated: firestore.Timestamp.fromDate(merged.date),
        });
    }

    await this.client.collection(FLASHCARD_SCORE).add(score);
  }

  async getFlashcardUpdates(
    since: getFlashcardsParams
  ): Promise<FlashcardUpdates> {
    const queryCards = await this.client
      .collection(FLASHCARD)
      .where("updated", ">", firestore.Timestamp.fromDate(since.cards_since))
      .get();

    const queryProgress = await this.client
      .collection(FLASHCARD_PROGRESS)
      .where("updated", ">", firestore.Timestamp.fromDate(since.progress_since))
      .get();

    const queryStatistics = await this.client
      .collection(FLASHCARD_STATISTICS)
      .where(
        "updated",
        ">",
        firestore.Timestamp.fromDate(since.statistics_since)
      )
      .get();

    const querySpecial = await this.client
      .collection(FLASHCARD_SPECIAL)
      .where("updated", ">", firestore.Timestamp.fromDate(since.special_since))
      .get();

    return {
      cards: queryCards.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          created: data.created.toDate(),
          updated: data.updated.toDate(),
          id: doc.id,
        } as StoredFlashcard;
      }),
      progress: queryProgress.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          flashcardId: doc.id,
          updated: data.updated.toDate(),
        } as StoredFlashcardProgress;
      }),
      special: querySpecial.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          flashcardId: doc.id,
          updated: data.updated.toDate(),
        } as StoredFlashcardSpecial;
      }),
      statistics: queryStatistics.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          updated: data.updated.toDate(),
        } as StoredFlashcardStatistics;
      }),
      delete: [],
    };
  }

  async updateFlashcardProgress(
    id: string,
    date: Date,
    progress: FlashcardProgress
  ): Promise<void> {
    await this.client
      .collection(FLASHCARD_PROGRESS)
      .doc(id)
      .set({
        ...progress,
        updated: firestore.Timestamp.fromDate(date),
    });
  }

  async updateFlashcard(flashcard: NotionFlashcard): Promise<void> {
    console.log(flashcard);
    const query = await this.client
      .collection(FLASHCARD)
      .where("notionId", "==", flashcard.id)
      .limit(1)
      .get();

    if (query.size > 0) {
      const [doc] = query.docs;
      doc.ref.update({
        term: flashcard.term,
        tags: flashcard.tags,
        definition: flashcard.definition,
        updated: firestore.Timestamp.fromDate(flashcard.edited),
      });
    }
  }

  async addFlashcard(flashcard: NotionFlashcard): Promise<void> {
    const newCard: Omit<StoredFlashcard, "id"> = {
      created: flashcard.created,
      definition: flashcard.definition,
      tags: flashcard.tags,
      updated: flashcard.edited,
      notionId: flashcard.id,
      term: flashcard.term,
    };

    const { id } = await this.client.collection(FLASHCARD).add(newCard);
    // todo create a default progress outside this class
    this.updateFlashcardProgress(id, newCard.updated, {
      ease: 1.3,
      interval: 1,
      repetitions: 0,
    });
  }

  async removeFlashcard(id: string): Promise<void> {
    // save thid id somewhere, to sync all the cleints with the deleted cards
    await this.client.collection(FLASHCARD).doc(id).delete();
  }

	async reportMode(mode: string): Promise<void> {
		await this.client.collection(MODE).add({
			at: firestore.Timestamp.now(),
			mode,
		});
	}

	async updateRecentBlogDate(date: Date): Promise<void> {
		await this.client.doc(BLOG).set({
			date: firestore.Timestamp.fromDate(date),
		});
	}

	async lastSeenBlogUpdate(): Promise<Date> {
		const doc = await this.client.doc(BLOG).get();
		const data = doc.data();
		if (data) {
			return (data.date as FirebaseFirestore.Timestamp).toDate();
		} else {
			return new Date("1970 01 01");
		}
	}

	async addSyncedInboxes(syncedInboxes: syncedInboxes): Promise<void> {
		await this.client.collection(SYNCEDINBOXES).add(syncedInboxes);
	}
	async updateTicktickAuth(auth: string): Promise<void> {
		await this.client.doc(CONFIG).update({
			"auth.ticktick":auth,
		});
		
	}

	async getCompletedTasks(after?: Date) {
		let ref = this.client.collection(TASKS).where("done", "==", true);
		if (after) {
			ref = ref.where(
				"created",
				">=",
				firestore.Timestamp.fromDate(after)
			);
		}

		const query = await ref.get();

		return query.docs.map((d) => d.data()) as (task & { done: true })[];
	}

	async appConfig(): Promise<AppConfig> {
		const doc = await this.client.doc(CONFIG).get();
		const config = doc.data();
		if (config) {
			return this.validateConfig(config);
		} else {
			throw Error(
				`application configuration doesn't exists in the provided database, path(${CONFIG}) is empty`
			);
		}
	}

	getTasks(): Promise<task[]> {
		throw new Error("Method not implemented.");
	}

	async addTask(task: task): Promise<void> {
		const exists = await this.getTask(task.id);

		// FIXME is it goo to throw time here without information the rest of the system
		const taskWithTime = {
			...task,
			created: firestore.Timestamp.now(),
		};

		if (exists) {
			await this.client.doc(`${TASKS}/${exists.id}`).update(taskWithTime);
		} else {
			await this.client.collection(TASKS).add(taskWithTime);
		}
	}

	/**
	 *
	 * @param taskId it's not the document id, but rather a stored id withing the document it self
	 */
	private async getTask(taskId: string) {
		const ref = this.client.collection(TASKS).where("id", "==", taskId);
		const query = await ref.get();

		if (query.size) {
			return query.docs[0];
		}
	}

	private validateConfig(config: any): AppConfig {
		// todo validate and create a default configuration
		if (!(config as AppConfig).ticktickConfig.password) {
			config.ticktickConfig.password =
				process.env.TICKTICK_DEFAULT_PASSWORD;
		}

		return config;
	}
}
