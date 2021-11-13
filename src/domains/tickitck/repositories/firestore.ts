import { firestore } from "firebase-admin";
import { anyDateToFirestore, anyFirestoreToDate } from "../../../core/utils";
import { dateToTicktickFormat } from "../../../services/ticktick";
import Ranking from "../models/ranking";

const RANKING = "/ticktick_ranking";

export default class Firestore {
  private readonly client: firestore.Firestore;
  constructor(client: firestore.Firestore) {
    this.client = client;
  }

  async addRanking(data: Ranking) {
    await this.client
      .collection(RANKING)
      .doc(dateToTicktickFormat(data.date))
      .set(anyDateToFirestore(data));
  }

  async getRanking(): Promise<Ranking[]> {
    const query = await this.client.collection(RANKING).get();
    return query.docs.map((d) => anyFirestoreToDate(d.data()));
  }
}
