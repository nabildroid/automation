import TicktickGeneralStats from "../../entities/ticktick_general_stats";
import TicktickTask from "../../entities/ticktick_task";

export default interface ITicktick {
	getTask(id: string, list: string): Promise<TicktickTask | undefined>;
	addToInbox(title: string, body?: string): Promise<TicktickTask>;
	getCompletedTasks(after: Date): Promise<TicktickTask[]>;
	getGeneralStatistis(): Promise<TicktickGeneralStats>;
}
