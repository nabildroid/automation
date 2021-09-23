import ticktick_task from "../entities/ticktick_task";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	constructor(auth: string) {}
	getInbox(): Promise<ticktick_task[]> {
		throw new Error("Method not implemented.");
	}
	addToInbox(task: ticktick_task): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getCompletedTasks(): Promise<ticktick_task[]> {
		throw new Error("Method not implemented.");
	}
	getTask(id: string): Promise<ticktick_task> {
		throw new Error("Method not implemented.");
	}
}
