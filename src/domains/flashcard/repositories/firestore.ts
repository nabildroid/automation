import { firestore } from "firebase-admin";
import { anyDateToFirestore, anyFirestoreToDate } from "../../../core/utils";
import { FlashcardProgress, FlashcardSpecial } from "../models/flashcard";
import flashcard_score, {
  FlashcardStatistics,
} from "../models/flashcard_score";
import NotionFlashcard from "../models/notion_flashcard";
import StoredFlashcard, {
  StoredFlashcardProgress,
  StoredFlashcardSpecial,
  StoredFlashcardStatistics,
} from "../models/storedFlashcard";

const FLASHCARD = "/flashcards/";
const FLASHCARD_SCORE = "/flashcard_score";
const FLASHCARD_PROGRESS = "/flashcard_progress";
const FLASHCARD_SPECIAL = "/flashcard_special";
const FLASHCARD_STATISTICS = "/flashcard_statistics";

export interface getFlashcardsParams {
  cards_since: Date;
  progress_since: Date;
  special_since: Date;
  context_since?: Date;
  statistics_since: Date;
  deleted_since?: Date;
}

export interface FlashcardUpdates {
  cards: StoredFlashcard[];
  progress: StoredFlashcardProgress[];
  statistics: StoredFlashcardStatistics[];
  special: StoredFlashcardSpecial[];
  delete: string[];
}

export default class Firestore {
  private readonly client: firestore.Firestore;
  constructor(client: firestore.Firestore) {
    this.client = client;
  }
  async getFlashcards(): Promise<StoredFlashcard[]> {
    const flashcards = await this.client.collection(FLASHCARD).get();

    const list = flashcards.docs
      .map<any>((d) => ({ ...d.data(), id: d.id }))
      .map(anyFirestoreToDate);

    return list as StoredFlashcard[];
  }

  async getFlashcardsScores(): Promise<flashcard_score[]> {
    const query = await this.client.collection(FLASHCARD_SCORE).get();
    return query.docs.map((doc) => {
      const data = doc.data();
      return anyFirestoreToDate(data);
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
      .set(anyDateToFirestore({ ...content, updated: date }));
  }

  async addFlashcardStatistic(statistics: FlashcardStatistics) {
    await this.client
      .collection(FLASHCARD_STATISTICS)
      .add(anyDateToFirestore({ ...statistics, updated: statistics.date }));
  }
  async addFlashcardScore(score: flashcard_score): Promise<void> {
    await this.client
      .collection(FLASHCARD_SCORE)
      .add(anyDateToFirestore(score));
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
      cards: queryCards.docs
        .map((doc) => {
          const data = anyFirestoreToDate(doc.data());
          return {
            ...data,
            id: doc.id,
          } as StoredFlashcard;
        })
        .filter((c) => c.published),

      progress: queryProgress.docs.map((doc) => {
        const data = anyFirestoreToDate(doc.data());
        return {
          ...data,
          flashcardId: doc.id,
        } as StoredFlashcardProgress;
      }),
      special: querySpecial.docs.map((doc) => {
        const data = anyFirestoreToDate(doc.data());
        return {
          ...data,
          flashcardId: doc.id,
        } as StoredFlashcardSpecial;
      }),
      statistics: queryStatistics.docs.map((doc) => {
        const data = anyFirestoreToDate(doc.data());
        return {
          ...data,
        } as StoredFlashcardStatistics;
      }),
      delete: queryCards.docs
        .map((doc) => {
          const data = anyFirestoreToDate(doc.data());
          return {
            ...data,
            id: doc.id,
          } as StoredFlashcard;
        })
        .filter((c) => !c.published)
        .map((c) => c.id),
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
      .set(
        anyDateToFirestore({
          ...progress,
          updated: date,
        })
      );
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
      doc.ref.update(
        anyDateToFirestore({
          term: flashcard.term,
          tags: flashcard.tags,
          definition: flashcard.definition,
          updated: flashcard.edited,
          published: flashcard.published,
        })
      );
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
      published: flashcard.published,
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
}
