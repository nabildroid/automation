import Task from "../../core/entities/task";
import AppConfig from "../../entities/app_config";

export default interface IFirestore {
	appConfig(): Promise<AppConfig>;

	getTasks(): Promise<Task[]>;
	addTask(task: Task): Promise<void>;
}
