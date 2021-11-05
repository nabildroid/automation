import { InputPropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { Page } from "@notionhq/client/build/src/api-types";
import NotionCore from "../../../core/repositories/notion_core";
import Flashcard from "../models/flashcard";
import NotionFlashcard from "../models/notion_flashcard";

export type Config = {
  flashcard: string;
};

export default class Notion extends NotionCore<Config> {
  constructor(auth: string, config: Config) {
    super(auth, config);
  }

  async addFlashcard(flashcard: Flashcard): Promise<void> {
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
      published:
        Notion.extractProperty<string>("status", page.properties) ==
        "published",
    }));

    return list;
  }
}
