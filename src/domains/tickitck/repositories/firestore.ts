import { firestore } from "firebase-admin";
import { anyDateToFirestore, anyFirestoreToDate } from "../../../core/utils";


export default class Firestore {
  private readonly client: firestore.Firestore;
  constructor(client: firestore.Firestore) {
    this.client = client;
  }

}
