import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { Block } from "@notionhq/client/build/src/api-types";
import { TaskContent } from "../../../core/entities/task";
import NotionCore from "../../../core/repositories/notion_core";
import NotionInbox, { NotionInboxMetadata } from "../models/notion_inbox";
import Tweet from "../models/tweet";

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

    if (page.archived) return;

    return {
      id: page.id,
      title: Notion.extractProperty<string>("title", page.properties),
      tags: Notion.extractProperty<string[]>("tags", page.properties),
      done: Notion.extractProperty<boolean>("done", page.properties),
      source: "notion",
      parent: (page.parent as any).database_id,
      body: [],
    };
  }

  async updateInbox(id: string, content: Partial<TaskContent<Block[]>>) {
    const { properties, body } = createInboxItem(content, {});

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

  async addToInbox(
    content: TaskContent<Block[]>,
    metadata?: NotionInboxMetadata
  ): Promise<NotionInbox> {
    const { properties, body } = createInboxItem(content, metadata ?? {});

    const { id, parent } = await this.client.pages.create({
      parent: {
        database_id: this.config.inbox,
      },
      properties: properties,
      children: body,
    });

    return {
      done: false,
      id,
      parent: (parent as any).database_id,
      source: "notion",
      title: content.title,
      tags: [],
      body: content.body,
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
      body: [],
    };
  }

  static TweetsTemplate(tweets: Tweet[], root = true): Block[] {
    const childrens: Block[] = [];

    for (const tweet of tweets) {
      if (tweet.image) {
        childrens.push({
          image: {
            external: {
              url: tweet.image!,
            },
          },
        } as Block);
      }

      childrens.push({
        bulleted_list_item: {
          text: [
            {
              type: "text",
              text: {
                content: tweet.text,
              },
            },
          ],
          children: tweet.childrens?.length
            ? [
                {
                  toggle: {
                    text: [
                      {
                        type: "text",
                        text: {
                          content: tweet.childrens[0].text.split("\n")[0],
                        },
                      },
                    ],
                    children: [
                      ...Notion.TweetsTemplate(tweet.childrens, false),
                      {
                        embed: {
                          url: tweet.childrens[0].link,
                        },
                      },
                    ],
                  },
                },
              ]
            : undefined,
        },
      } as Block);

      if (root) {
        childrens.push({
          type: "divider",
          divider: {},
        } as unknown as Block);
        childrens.push({
          type: "paragraph",
          paragraph: {
            text: [{ text: { content: "" } }],
          },
        } as Block);
      }
    }

    return childrens;
  }
}

function createInboxItem(
  content: Partial<TaskContent<Block[]>>,
  meta: NotionInboxMetadata
) {
  const properties: InputPropertyValueMap = {};

  if (content.done !== undefined)
    properties["done"] = {
      type: "checkbox",
      checkbox: content.done,
    };

  if (content.tags !== undefined)
    properties["tags"] = {
      type: "multi_select",
      multi_select: content.tags.map((tag) => ({ name: tag })),
    };

  if (content.title !== undefined)
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

  if (meta.note !== undefined)
    properties["Note"] = {
      type: "checkbox",
      checkbox: meta.note,
    };

  if (meta.context !== undefined)
    properties["context"] = {
      type: "multi_select",
      multi_select: meta.context.map((tag) => ({ name: tag })),
    };

  if (meta.source !== undefined)
    properties["source"] = {
      type: "url",
      url: meta.source,
    };

  if (meta.nextCheck !== undefined) {
    properties["nextCheck"] = {
      type: "date",
      date: {
        start: meta.nextCheck.toISOString(),
      },
    };
  }

  return {
    properties,
    body: (content.body ?? []) as Block[],
  };
}
