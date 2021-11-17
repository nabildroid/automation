import { Block } from "@notionhq/client/build/src/api-types";
import { TaskContent, TaskReference } from "../../../core/entities/task";

export default interface NotionInbox
  extends TaskContent<Block[]>,
    TaskReference {
  source: "notion";
}

export interface NotionInboxMetadata {
  for?: string;
  source?: string;
  nextCheck?: Date;
  note?: boolean;
  context?: string[];
}
