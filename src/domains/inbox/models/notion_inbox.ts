import { TaskContent, TaskReference } from "../../../core/entities/task";

export default interface NotionInbox extends TaskContent, TaskReference {
  source: "notion";
}
