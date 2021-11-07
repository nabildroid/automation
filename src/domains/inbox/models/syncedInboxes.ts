import TicktickTask from "../../../core/entities/ticktick_task";
import NotionInbox from "./notion_inbox";

export default interface syncedInboxes {
	notion: NotionInbox;
	ticktick: TicktickTask;
}

export enum SyncState {
	deleted,
	synced,
	notionOff,
	ticktickOff,
    bothOff,
    notionDone,
	tickticDone,
}
