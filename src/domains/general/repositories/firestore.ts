import { firestore } from "firebase-admin";
import PocketCheck from "../../../core/entities/pocket_check";
import {
  anyDateToFirestore,
  anyFirestoreToDate,
} from "../../../core/utils";
import pocket_article from "../models/pocket_article";

const BLOG = "/blog/last_update";
const MODE = "/mode/";


const POCKET = "/general/pocket";
const POCKET_ARTICLES = "/pocket_articles";

export default class Firestore  {
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


}
