import notion_inbox from "../entities/notion_inbox";
import notion_journal from "../entities/notion_journal";
import INotion from "./contracts/iNotion";
import { Client } from "@notionhq/client";
import { NotionConfig } from "../entities/app_config";
export default class Notion implements INotion {
	private readonly client: Client;
	private readonly config: NotionConfig;
	constructor(auth: string, config: NotionConfig) {
		this.client = new Client({
			auth,
		});
		this.config = config;
	}

	getInbox(): Promise<notion_inbox[]> {
		throw new Error("Method not implemented.");
	}
	getTodayJournal(): Promise<notion_journal> {
		throw new Error("Method not implemented.");
	}
	async createJournal(): Promise<notion_journal> {
		throw new Error("Method not implemented.");
	}
	addJournalData(journal: notion_journal, data: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
