import TicktickTask from "../../entities/ticktick_task";

export default interface ITicktick {
	getTask(id: string, list: string): Promise<TicktickTask>;
}
