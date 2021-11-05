import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Firestore from "../repositories/firestore";
import Notion from "../repositories/notion";

export default class NotionBlog implements IRoute {
  notion: Notion;
  db: Firestore;
  constructor(notion: Notion, db: Firestore) {
    this.notion = notion;
    this.db = db;
  }

  async handler(_: Request, res: Response) {
    const blogs = await this.notion.listBlog();

    const lastUpdatedBlog = blogs.sort(
      (a, b) => b.lastEdited.getTime() - a.lastEdited.getTime()
    )[0];
    const lastSeenUpdate = await this.db.lastSeenBlogUpdate();

    const isUpdated =
      lastSeenUpdate.toISOString() != lastUpdatedBlog.lastEdited.toISOString();

    if (isUpdated) {
      await this.db.updateRecentBlogDate(lastUpdatedBlog.lastEdited);

      const fullBlogs = await Promise.all(
        blogs.map(async (blog) => ({
          blog,
          content: await this.notion.getBlogContent(blog),
        }))
      );

      return res.send(JSON.stringify(fullBlogs));
    } else return res.send("[]");
  }
}
