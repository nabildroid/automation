import ticktick_task from "../entities/ticktick_task";
import ITicktick from "./contracts/iTicktick";

export default class Ticktick implements ITicktick {
	constructor(auth: string) {}

	getTask(id: string): Promise<ticktick_task> {
		throw new Error("Method not implemented.");
	}

	static parseTaskUrl(url: string) {
		// todo check the url validity
		const parts = url.split("/");
		const taskId = parts.pop();
		parts.pop(); // == "tasks"
		const list = parts.pop();

		if (!taskId || !list) throw Error("Unvalide Ticktick Task Url");

		return {
			taskId,
			list,
		};
	}
}
