import TicktickTask from "../../entities/ticktick_task";

export default interface ITicktick {
	getInbox(): Promise<TicktickTask[]>;
	addToInbox(task: TicktickTask): Promise<void>;
	getCompletedTasks(): Promise<TicktickTask[]>;
	getTask(id: string): Promise<TicktickTask>;
}
