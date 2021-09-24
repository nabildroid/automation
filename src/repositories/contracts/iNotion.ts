import NotionInbox from "../../entities/notion_inbox";
import NotionJournal from "../../entities/notion_journal";
import TicktickTask from "../../entities/ticktick_task";

export default interface INotion {
	getInbox(): Promise<NotionInbox[]>;
	getTodayJournal(): Promise<NotionJournal>;
	createJournal(ticktickTasks: TicktickTask[]): Promise<NotionJournal>;
	addJournalData(journal: NotionJournal, data: string): Promise<void>;
}
