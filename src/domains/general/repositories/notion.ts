import NotionCore from "../../../core/repositories/notion_core";
import NotionBlog, { NotionBlogContent } from "../models/notion_blog";


export type Config = {
  blog: string;
};

export default class Notion extends NotionCore<Config> {
  constructor(auth: string, config: Config) {
    super(auth, config);
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

    return NotionCore.toMakrdown(children.results);
  }
}
