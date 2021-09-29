import NotionInbox from "./notion_inbox";
import TicktickTask from "./ticktick_task";

export default interface syncedInboxes {
	notion: NotionInbox;
	ticktick: TicktickTask;
}

export enum SyncState {
	synced,
	notionOff,
	ticktickOff,
    bothOff,
    notionDone,
	tickticDone,
}
