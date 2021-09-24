import { NotionRow } from "../core/entities/notion_row";

export default interface NotionJournal extends NotionRow {
	done: false;
}
