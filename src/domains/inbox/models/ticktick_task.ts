import Task from "../../../core/entities/task";

export default interface TicktickTask extends Task {
	source: "ticktick";
	title: string;
	tags: string[];
}
