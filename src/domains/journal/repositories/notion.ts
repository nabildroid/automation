import { Block } from "@notionhq/client/build/src/api-types";
import TicktickTask from "../../../core/entities/ticktick_task";
import NotionCore from "../../../core/repositories/notion_core";
import notion_journal from "../models/notion_journal";

export type Config = {
  journal: string;
};

export default class Notion extends NotionCore<Config> {
  constructor(auth: string, config: Config) {
    super(auth, config);
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
