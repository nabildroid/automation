import { NotionRow } from "../../../core/entities/notion_row";

export default interface NotionBlog extends NotionRow {
	lastEdited: Date;
	tags: string[];
	title: string;
}

export type NotionBlogContent = any;
