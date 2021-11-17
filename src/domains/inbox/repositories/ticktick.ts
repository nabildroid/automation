import TicktickClient from "../../../services/ticktick";
import ticktick_task from "../../../core/entities/ticktick_task";
import { TaskContent } from "../../../core/entities/task";

export type Config = {
  inbox: string;
};
export default class Ticktick {
  private readonly client: TicktickClient;
  readonly config: Config;
  constructor(client: TicktickClient, config: Config) {
    this.client = client;
    this.config = config;
  }

  async updateInbox(id: string, content: Partial<TaskContent<string>>) {
    await this.client.updateTasks([
      {
        id,
        project: this.config.inbox,
        content: content?.body,
        status: content?.done ? 2 : 0,
        tags: content?.tags,
        title: content?.title,
      },
    ]);
  }

  async deleteInbox(id: string) {
    await this.client.deleteTasks([
      {
        taskId: id,
        projectId: this.config.inbox,
      },
    ]);
  }

  async addToInbox(content: TaskContent<string>): Promise<ticktick_task> {
    const { data, status } = await this.client.createTasks([
      {
        title: content.title,
        content: content.body,
        tags: content.tags,
        status: content.done ? 2 : 0,
      },
    ]);

    const { id2etag } = data;
    const id = Object.keys(id2etag)[0] as string;

    return {
      ...content,
      id,
      parent: this.config.inbox,
      source: "ticktick",
    };
  }

  async getTask(id: string, list: string): Promise<ticktick_task | undefined> {
    try {
      const { data, status } = await this.client.getTask(id, list);

      if (status != 200) {
        throw new Error("unable to get the task");
      } else {
        return {
          id: data.id,
          parent: data.projectId,
          title: data.title,
          done: data.status == 2,
          tags: data.tags || [],
          source: "ticktick",
          body: data.content,
        };
      }
    } catch (error) {
      return undefined;
    }
  }
}
