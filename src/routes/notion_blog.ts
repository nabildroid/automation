import IRoute from "../core/types/iroute";

import { Request, Response } from "express";

import IApp from "../core/contract/iapp";

export default class NotionBlog implements IRoute {
	readonly app: IApp;
	constructor(app: IApp) {
		this.app = app;
	}

	async handler(_: Request, res: Response) {
		const blogs = await this.app.notion.listBlog();
		const lastUpdatedBlog = blogs.sort(
			(a, b) => a.lastEdited.getTime() - b.lastEdited.getTime()
		)[0];

		const lastSeenUpdate = await this.app.db.lastSeenBlogUpdate();

		if (lastSeenUpdate != lastUpdatedBlog.lastEdited) {
			await this.app.db.updateRecentBlogDate(lastUpdatedBlog.lastEdited);

			const fullBlogs = await Promise.all(
				blogs.map(async (blog) => ({
					blog,
					content: await this.app.notion.getBlogContent(blog),
				}))
			);

			res.send(JSON.stringify(fullBlogs));
		}
	}
}
