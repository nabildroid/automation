export default interface Task {
	id: string;
	parent: string;
	done: boolean;
	source: "notion" | "ticktick";
}
