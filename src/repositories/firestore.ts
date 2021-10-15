import { firestore } from "firebase-admin";
import flashcard_score, {
  FlashcardProgress,
} from "../core/entities/flashcard_score";
import Task from "../core/entities/task";
import task from "../core/entities/task";
import AppConfig from "../entities/app_config";
import NotionFlashcard from "../entities/notion_flashcard";
import StoredFlashcard from "../entities/storedFlashcard";
import syncedInboxes from "../entities/syncedInboxes";
import IFirestore from "./contracts/iFirestore";

const CONFIG = "/general/config";
const TASKS = "/tasks";
const SYNCEDINBOXES = "/synced_inboxes";
const BLOG = "/blog/last_update";
const MODE = "/mode/";
const FLASHCARD = "/flashcards/";
const FLASHCARD_SCORE = "/flashcard_score/";

export default class Firestore implements IFirestore {
	private readonly client: firestore.Firestore;
	constructor(client: firestore.Firestore) {
		this.client = client;
	}
	
  async addFlashcardScore(score: flashcard_score): Promise<void> {
    await this.client.collection(FLASHCARD_SCORE).add(score);
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

  async updateFlashcardProgress(
    id: string,
    progress: FlashcardProgress
  ): Promise<void> {
    await this.client.collection(FLASHCARD).doc(id).update({
      progress,
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
      progress: {
        ease: 1.3,
        interval: 1,
        repetitions: 0,
      },
    };

    await this.client.collection(FLASHCARD).add(newCard);
  }

  async removeFlashcard(id: string): Promise<void> {
    await this.client.doc(`${FLASHCARD}/${id}`).delete();
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
