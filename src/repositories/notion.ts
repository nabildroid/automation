import NotionInbox from "../entities/notion_inbox";
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

	getInbox(id: string): Promise<NotionInbox | undefined> {
		throw new Error("Method not implemented.");
	}
	async addToInbox(title: string, body?: string): Promise<NotionInbox> {
		const { id, parent } = await this.client.pages.create({
			parent: {
				database_id: this.config.inbox,
			},
			properties: {
				title: {
					type: "title",
					title: [
						{
							type: "text",
							text: {
								content: title,
							},
						},
					],
				},
			},
			children: body
				? ([
						{
							paragraph: {
								text: [
									{
										type: "text",
										text: {
											content: body,
										},
									},
								],
							},
						},
				  ] as Block[])
				: [],
		});

		return {
			done: false,
			id,
			parent: (parent as any).database_id,
			source: "notion",
		};
	}

	async addScreenshotToInbox(url: string): Promise<NotionInbox> {
		const { id, parent } = await this.client.pages.create({
			parent: {
				database_id: this.config.inbox,
			},
			properties: {
				title: {
					type: "title",
					title: [
						{
							type: "text",
							text: {
								content: "Screenshot",
							},
						},
						{
							type: "mention",
							mention: {
								type: "date",

								date: {
									start: new Date().toISOString(),
								},
							},
						} as any,
					],
				},
			},
			children: [
				{
					image: {
						external: {
							url, // todo store the file in GCS, sense Notion uses the provided link instead of uploading a copy
						},
						caption: [
							{
								type: "text",
								text: {
									content: "Screenshot taken from your phone",
								},
							},
						],
					},
				},
			] as Block[],
		});

		return {
			done: false,
			id,
			parent: (parent as any).database_id,
			source: "notion",
		};
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

	private async todayJournal(defaultTitle: string) {
		return (
			(await this.getTodayJournal()) ||
			(await this.createTodayJournal("Completed Tasks"))
		);
	}

	async addJournal(ticktickTasks: TicktickTask[]): Promise<notion_journal> {
		const journal = await this.todayJournal("Completed Tasks");

		await this.client.blocks.children.append({
			block_id: journal.id,
			children: Notion.createJournalBlocks(ticktickTasks),
		});

		return journal;
	}

	private async createTodayJournal(title: string): Promise<notion_journal> {
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
								content: title,
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
