import {
  FlashcardProgress,
  FlashcardSpecial,
} from "../../core/entities/flashcard";
import FlashcardScore, {
  FlashcardStatistics,
} from "../../core/entities/flashcard_score";
import Task from "../../core/entities/task";
import AppConfig from "../../entities/app_config";
import NotionFlashcard from "../../entities/notion_flashcard";
import StoredFlashcard, {
  StoredFlashcardProgress,
  StoredFlashcardSpecial,
  StoredFlashcardStatistics,
} from "../../entities/storedFlashcard";
import SyncedInboxes from "../../entities/syncedInboxes";

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
export default interface IFirestore {
	appConfig(): Promise<AppConfig>;

	getTasks(): Promise<Task[]>;
	getCompletedTasks(after?:Date): Promise<(Task & { done: true })[]>;
	addTask(task: Task): Promise<void>;
	addSyncedInboxes(syncedInboxes: SyncedInboxes): Promise<void>;
	updateTicktickAuth(auth: string): Promise<void>;

	updateRecentBlogDate(date: Date): Promise<void>;
	lastSeenBlogUpdate(): Promise<Date>;

	reportMode(mode: string): Promise<void>;

  getFlashcardUpdates({}: getFlashcardsParams): Promise<FlashcardUpdates>;
  getFlashcards(): Promise<StoredFlashcard[]>;

  updateFlashcardProgress(
    id: string,
    date: Date,
    progress: FlashcardProgress
  ): Promise<void>;

  updateFlashcard(flashcard: NotionFlashcard): Promise<void>;
  addFlashcard(flashcard: NotionFlashcard): Promise<void>;
  removeFlashcard(id: string): Promise<void>;

  addFlashcardScore(
    score: FlashcardScore,
    statistics: FlashcardStatistics
  ): Promise<void>;
  updateSpecialFlashcard(
    id: string,
    data: FlashcardSpecial,
    date: Date
  ): Promise<void>;

  getFlashcardsScores(): Promise<FlashcardScore[]>;
}
