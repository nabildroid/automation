import { Client } from "@notionhq/client/build/src";
import { PropertyValueMap } from "@notionhq/client/build/src/api-endpoints";
import { Block } from "@notionhq/client/build/src/api-types";

export default class NotionCore<Config extends { [key: string]: string }> {
  protected readonly client: Client;
  protected readonly config: Config;
  constructor(auth: string, config: Config) {
    this.client = new Client({
      auth,
    });
    this.config = config;
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
