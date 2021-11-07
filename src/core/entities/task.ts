export type Sources = "notion" | "ticktick";

export interface TaskReference {
  id: string;
  parent: string;
  source: Sources;
}
export default interface Task extends TaskReference {
  done: boolean;
}

export interface TaskContent {
  title: string;
  body: string;
  tags: string[];
  done: boolean;
}
