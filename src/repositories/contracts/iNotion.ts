import NotionBlog, { NotionBlogContent } from "../../entities/notion_blog";
import NotionFlashcard from "../../entities/notion_flashcard";
import NotionInbox from "../../entities/notion_inbox";
import NotionJournal from "../../entities/notion_journal";
import TicktickTask from "../../entities/ticktick_task";

export default interface INotion {
  getInbox(id: string): Promise<NotionInbox | undefined>;
  addJournal(ticktickTasks: TicktickTask[]): Promise<NotionJournal>;
  addScreenshotToInbox(url: string): Promise<NotionInbox>;
  addToInbox(title: string, body?: string): Promise<NotionInbox>;
  listBlog(): Promise<NotionBlog[]>;
  getBlogContent(blog: NotionBlog): Promise<NotionBlogContent>;

  getFlashcards(): Promise<NotionFlashcard[]>;
}
