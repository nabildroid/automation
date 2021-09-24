import ticktick_task from "../entities/ticktick_task";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	constructor(auth: string) {}

	getTask(id: string): Promise<ticktick_task> {
		throw new Error("Method not implemented.");
	}
}
