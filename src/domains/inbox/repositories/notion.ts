import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { Block } from "@notionhq/client/build/src/api-types";
import { TaskContent } from "../../../core/entities/task";
import NotionCore from "../../../core/repositories/notion_core";
import NotionInbox from "../models/notion_inbox";

export type Config = {
  inbox: string;
};

export default class Notion extends NotionCore<Config> {
  constructor(auth: string, config: Config) {
    super(auth, config);
  }

  async getInbox(id: string): Promise<NotionInbox | undefined> {
    const page = await this.client.pages.retrieve({
      page_id: id,
    });

    return {
      id: page.id,
      title: Notion.extractProperty<string>("title", page.properties),
      tags: Notion.extractProperty<string[]>("tags", page.properties),
      done: Notion.extractProperty<boolean>("done", page.properties),
      source: "notion",
      parent: (page.parent as any).database_id,
      body: "",
    };
  }

  async updateInbox(id: string, content: Partial<TaskContent>) {
    const properties: InputPropertyValueMap = {};
    if (content.done) {
      properties["done"] = {
        type: "checkbox",
        checkbox: content.done,
      };
    }
    if (content.tags) {
      properties["tags"] = {
        type: "multi_select",
        multi_select: content.tags.map((tag) => ({ name: tag })),
      };
    }

    if (content.title) {
      properties["title"] = {
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: content.title,
            },
          },
        ],
      };
    }

    await this.client.pages.update({
      page_id: id,
      properties,
      archived: false,
    });
  }

  async deleteInbox(id: string) {
    await this.client.pages.update({
      page_id: id,
      archived: true,
      properties: {},
    });
  }

  async addToInbox(content: TaskContent): Promise<NotionInbox> {
    const properties: InputPropertyValueMap = {};
    properties["done"] = {
      type: "checkbox",
      checkbox: content.done,
    };
    properties["tags"] = {
      type: "multi_select",
      multi_select: content.tags.map((tag) => ({ name: tag })),
    };
    properties["title"] = {
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: content.title,
          },
        },
      ],
    };

    const { id, parent } = await this.client.pages.create({
      parent: {
        database_id: this.config.inbox,
      },
      properties: properties,
      children: content.body
        ? ([
            {
              paragraph: {
                text: [
                  {
                    type: "text",
                    text: {
                      content: content.body,
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
      title: content.title,
      tags: [],
      body: "",
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
                  content: "Screenshot is taken from your phone",
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
      tags: [],
      body: "",
    };
  }
}
