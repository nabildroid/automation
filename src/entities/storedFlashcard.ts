import Flashcard from "../core/entities/flashcard";
import { FlashcardProgress } from "../core/entities/flashcard_score";

export default interface StoredFlashcard extends Flashcard {
  id: string;
  notionId: string;
  created: Date;
  updated: Date;
  progress: FlashcardProgress;
}
