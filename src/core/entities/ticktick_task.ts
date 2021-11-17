import { TaskContent, TaskReference } from "./task";

export default interface TicktickTask
  extends TaskContent<string>,
    TaskReference {
  source: "ticktick";
}
