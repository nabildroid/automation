import Flashcard, {
  FlashcardProgress,
  FlashcardSpecial,
} from "../core/entities/flashcard";
import { FlashcardStatistics } from "../core/entities/flashcard_score";

export default interface StoredFlashcard extends Flashcard {
  id: string;
  notionId: string;
  created: Date;
  updated: Date;
  published:boolean;
}

export interface StoredFlashcardProgress extends FlashcardProgress {
  flashcardId: string;
  updated: Date;
}

export interface StoredFlashcardStatistics extends FlashcardStatistics {
  updated: Date;

}

export interface StoredFlashcardSpecial extends FlashcardSpecial {
  flashcardId: string;
  updated:Date,
}
