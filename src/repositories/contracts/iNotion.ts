import NotionInbox from "../../entities/notion_inbox";
import NotionJournal from "../../entities/notion_journal";

export default interface INotion {
	getInbox(): Promise<NotionInbox[]>;
	getTodayJournal(): Promise<NotionJournal>;
	createJournal(): Promise<NotionJournal>;
	addJournalData(journal: NotionJournal, data: string): Promise<void>;
}
