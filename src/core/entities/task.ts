export type Sources = "notion" | "ticktick";

export default interface Task {
	id: string;
	parent: string;
	done: boolean;
	source: Sources;
}
