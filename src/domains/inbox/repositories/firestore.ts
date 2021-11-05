import { firestore } from "firebase-admin";
import task from "../../../core/entities/task";
import syncedInboxes from "../models/syncedInboxes";
const TASKS = "/tasks";
const SYNCEDINBOXES = "/synced_inboxes";

export default class Firestore {
  private readonly client: firestore.Firestore;
  constructor(client: firestore.Firestore) {
    this.client = client;
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
