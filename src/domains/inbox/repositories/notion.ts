import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { Block } from "@notionhq/client/build/src/api-types";
import NotionCore from "../../../core/repositories/notion_core";
import NotionInbox from "../models/notion_inbox";

export type Config = {
  inbox: string;
};

export default class Notion extends NotionCore<Config> {
  constructor(auth: string, config: Config) {
    super(auth, config);
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
}
