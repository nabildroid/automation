import TicktickTask from "../../domains/inbox/models/ticktick_task";
import NotionJournal from "../../domains/journal/models/notion_journal";
import NotionBlog, { NotionBlogContent } from "../../entities/notion_blog";

export default interface INotion {
  listBlog(): Promise<NotionBlog[]>;
  getBlogContent(blog: NotionBlog): Promise<NotionBlogContent>;

}
