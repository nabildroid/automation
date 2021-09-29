import Task from "../../core/entities/task";
import AppConfig from "../../entities/app_config";
import SyncedInboxes from "../../entities/syncedInboxes";

export default interface IFirestore {
	appConfig(): Promise<AppConfig>;

	getTasks(): Promise<Task[]>;
	getCompletedTasks(after?:Date): Promise<(Task & { done: true })[]>;
	addTask(task: Task): Promise<void>;
	addSyncedInboxes(syncedInboxes: SyncedInboxes): Promise<void>;
	updateTicktickAuth(auth: string): Promise<void>;
}
