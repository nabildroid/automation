import notion_inbox from "../entities/notion_inbox";
import notion_journal from "../entities/notion_journal";
import INotion from "./contracts/iNotion";
import { Client } from "@notionhq/client";
import { NotionConfig } from "../entities/app_config";
import TicktickTask from "../entities/ticktick_task";
import { Block } from "@notionhq/client/build/src/api-types";
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
	private async getTodayJournal(): Promise<notion_journal | undefined> {
		const response = await this.client.databases.query({
			database_id: this.config.journal,
			page_size: 1,
		});

		const page = response.results.find((page) => {
			const created = new Date(page.created_time).toDateString();
			const today = new Date().toDateString();
			return created == today;
		});

		if (page) {
			return {
				done: false,
				id: page.id,
				parent: (page.parent as any).database_id,
				source: "notion",
			};
		}
	}

	async addJournal(ticktickTasks: TicktickTask[]): Promise<notion_journal> {
		const joural =
			(await this.getTodayJournal()) || (await this.createTodayJournal());

		await this.client.blocks.children.append({
			block_id: joural.id,
			children: Notion.createJournalBlocks(ticktickTasks),
		});

		return joural;
	}

	private async createTodayJournal(): Promise<notion_journal> {
		const { id, parent } = await this.client.pages.create({
			parent: {
				database_id: this.config.journal,
			},
			properties: {
				Name: {
					type: "title",
					title: [
						{
							type: "text",
							text: {
								content: "Completed-tasks",
							},
						},
					],
				},
			},
		});

		return {
			id,
			parent: (parent as any).database_id,
			done: false,
			source: "notion",
		};
	}

	static createJournalBlocks(ticktickTasks: TicktickTask[]): Block[] {
		return [
			{
				toggle: {
					text: [
						{
							type: "text",
							text: {
								content: "completedTasks",
							},
						},
					],
					children: ticktickTasks.map((task) => ({
						to_do: {
							checked: task.done,
							text: [
								{
									type: "text",
									text: {
										content: task.title,
									},
								},
							],
						},
					})),
				},
			},
		] as Block[];
	}
}
