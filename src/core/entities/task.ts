export type Sources = "notion" | "ticktick";

export interface TaskReference {
  id: string;
  parent: string;
  source: Sources;
}

export default interface Task extends TaskReference {
  done: boolean;
}

export interface TaskContent<T> {
  title: string;
  body: T;
  tags: string[];
  done: boolean;
}
