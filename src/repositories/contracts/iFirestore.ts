import Task from "../../core/entities/task";
import AppConfig from "../../entities/app_config";

export default interface IFirestore {
	appConfig(): Promise<AppConfig>;

	getTasks(): Promise<Task[]>;
	getCompletedTasks(after?:Date): Promise<(Task & { done: true })[]>;
	addTask(task: Task): Promise<void>;
	updateTicktickAuth(auth: string): Promise<void>;
}
