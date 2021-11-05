import INotion from "./contracts/iNotion";
import { Client } from "@notionhq/client";
import { NotionConfig } from "../core/entities/app_config";
import NotionBlog, { NotionBlogContent } from "../entities/notion_blog";
import NotionCore from "../core/repositories/notion_core";

export default class Notion implements INotion {
  private readonly client: Client;
  private readonly config: NotionConfig;
  constructor(auth: string, config: NotionConfig) {
    this.client = new Client({
      auth,
    });
    this.config = config;
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
      title: NotionCore.extractProperty<string>("Name", page.properties),
      done: !NotionCore.extractProperty<boolean>("private", page.properties),
      tags: NotionCore.extractProperty<string[]>("tags", page.properties),
    }));

    return list;
  }

  async getBlogContent(blog: NotionBlog): Promise<NotionBlogContent> {
    const children = await this.client.blocks.children.list({
      block_id: blog.id,
    });

    return NotionCore.childrenToMarkdown(children.results);
  }

  


  
}
