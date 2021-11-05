import Task from "./task";

export default interface TicktickTask extends Task {
	source: "ticktick";
	title: string;
	tags: string[];
}
