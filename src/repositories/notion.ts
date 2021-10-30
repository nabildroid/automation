import NotionInbox from "../entities/notion_inbox";
import notion_journal from "../entities/notion_journal";
import INotion from "./contracts/iNotion";
import { Client } from "@notionhq/client";
import { NotionConfig } from "../entities/app_config";
import TicktickTask from "../entities/ticktick_task";
import { Block, Page } from "@notionhq/client/build/src/api-types";
import NotionBlog, { NotionBlogContent } from "../entities/notion_blog";
import {
  InputPropertyValueMap,
  PropertyValueMap,
} from "@notionhq/client/build/src/api-endpoints";
import NotionFlashcard from "../entities/notion_flashcard";
import flashcard from "../core/entities/flashcard";

export default class Notion implements INotion {
  private readonly client: Client;
  private readonly config: NotionConfig;
  constructor(auth: string, config: NotionConfig) {
    this.client = new Client({
      auth,
    });
    this.config = config;
  }

  async addFlashcard(flashcard: flashcard): Promise<void> {
    const properties: InputPropertyValueMap = {};
    // todo refactor this, create a helper function that creates a properties!
    properties["term"] = {
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: flashcard.term,
          },
        },
      ],
    };
    properties["definition"] = {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: {
            content: flashcard.definition,
          },
        },
      ],
    };

    if (flashcard.source) {
      properties["source"] = {
        type: "url",
        url: flashcard.source,
      };
    }

    if (flashcard.from) {
      properties["from"] = {
        type: "select",
        select: {
          name: flashcard.from,
        },
      };
    }
    if (flashcard.tags) {
      properties["tags"] = {
        type: "multi_select",
        multi_select: flashcard.tags.map((tag) => ({
          name: tag,
        })),
      };
    }

    await this.client.pages.create({
      parent: {
        database_id: this.config.flashcard,
      },
      properties,
    });
  }

  async getFlashcards(): Promise<NotionFlashcard[]> {
    const flashcards: Page[] = [];
    let cursor: any = undefined;
    while (true) {
      const query = await this.client.databases.query({
      database_id: this.config.flashcard,
        start_cursor: cursor,
    });
      cursor = query.next_cursor;
      flashcards.push(...query.results);

      if (!query.has_more) break;
    }

    const list = flashcards.map<NotionFlashcard>((page) => ({
      id: page.id,
      edited: new Date(page.last_edited_time),
      created: new Date(page.created_time),
      definition: Notion.extractProperty<string>("definition", page.properties),
      term: Notion.extractProperty<string>("term", page.properties),
      tags: Notion.extractProperty<string[]>("tags", page.properties),
    }));

    return list;
  }

  async listBlog(): Promise<NotionBlog[]> {
    const blogs = await this.client.databases.query({
      database_id: this.config.blog,
    });

    const list = blogs.results.map<NotionBlog>((page) => ({
      id: page.id,
      parent: (page.parent as any).database_id,
      source: "notion",
      lastEdited: new Date(page.last_edited_time),
      title: Notion.extractProperty<string>("Name", page.properties),
      done: !Notion.extractProperty<boolean>("private", page.properties),
      tags: Notion.extractProperty<string[]>("tags", page.properties),
    }));

    return list;
  }

  async getBlogContent(blog: NotionBlog): Promise<NotionBlogContent> {
    const children = await this.client.blocks.children.list({
      block_id: blog.id,
    });

    return Notion.childrenToMarkdown(children.results);
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
      title,
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
      title: `Screenshot ${new Date().toISOString()}`,
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

  static childrenToMarkdown(children: Block[]): string {
    // todo implement this function
    return "markdown content";
  }

  static extractProperty<T extends any>(
    label: string,
    props: PropertyValueMap
  ) {
    const prop = props[label];
    switch (prop.type) {
      case "title":
        return prop.title
          .map((v) => v.plain_text)
          .join(" ")
          .trim() as T;
      case "rich_text":
        return prop.rich_text
          .map((v) => v.plain_text)
          .join(" ")
          .trim() as T;
      case "checkbox":
        return prop.checkbox as T;
      case "created_time":
        return new Date(prop.created_time) as T;
      case "date":
        return new Date(prop.date?.start!) as T;
      case "last_edited_time":
        return new Date(prop.last_edited_time) as T;
      case "multi_select":
        return prop.multi_select.map((s) => s.name) as T;
      case "number":
        return prop.number as T;
      case "select":
        return prop.select?.name as T;
      case "title":
        return prop.title
          .map((v) => v.plain_text)
          .join(" ")
          .trim() as T;
      default:
        throw Error("unsupported type");
    }
  }
}
