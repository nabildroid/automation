import FlashcardScore, {
  FlashcardProgress,
} from "../../core/entities/flashcard_score";
import Task from "../../core/entities/task";
import AppConfig from "../../entities/app_config";
import NotionFlashcard from "../../entities/notion_flashcard";
import StoredFlashcard from "../../entities/storedFlashcard";
import SyncedInboxes from "../../entities/syncedInboxes";

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

  getFlashcards(): Promise<StoredFlashcard[]>;
  updateFlashcardProgress(
    id: string,
    progress: FlashcardProgress
  ): Promise<void>;
  updateFlashcard(flashcard: NotionFlashcard): Promise<void>;
  addFlashcard(flashcard: NotionFlashcard): Promise<void>;
  removeFlashcard(id: string): Promise<void>;
  addFlashcardScore(score: FlashcardScore): Promise<void>;
  updateSpecialFlashcard(id: string, boosted: boolean): Promise<void>;
  getFlashcardsScores(): Promise<FlashcardScore[]>;
}
