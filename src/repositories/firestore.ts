import { firestore } from "firebase-admin";
import PocketCheck from "../core/entities/pocket_check";
import task from "../core/entities/task";
import {
  anyDateToFirestore,
  anyFirestoreToDate,
} from "../core/utils";
import pocket_article from "../entities/pocket_article";
import syncedInboxes from "../entities/syncedInboxes";
import IFirestore from "./contracts/iFirestore";

const CONFIG = "/general/config";
const TASKS = "/tasks";
const SYNCEDINBOXES = "/synced_inboxes";
const BLOG = "/blog/last_update";
const MODE = "/mode/";


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
        : null,
    });
  }

  async savePocketArticle(articles: pocket_article[]): Promise<void> {
    for (const arcticle of articles) {
      await this.client
        .collection(POCKET_ARTICLES)
        .doc(arcticle.id)
        .set(anyDateToFirestore(arcticle));
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
      return anyFirestoreToDate(data) as pocket_article;
    });
  }

  async reportMode(mode: string): Promise<void> {
    await this.client.collection(MODE).add({
      at: firestore.Timestamp.now(),
      mode,
    });
  }

  async updateRecentBlogDate(date: Date): Promise<void> {
    await this.client.doc(BLOG).set(
      anyDateToFirestore({
        date,
      })
    );
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


  async getCompletedTasks(after?: Date) {
    let ref = this.client.collection(TASKS).where("done", "==", true);
    if (after) {
      ref = ref.where("created", ">=", firestore.Timestamp.fromDate(after));
    }

    const query = await ref.get();

    return query.docs.map((d) => d.data()) as (task & { done: true })[];
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
}
