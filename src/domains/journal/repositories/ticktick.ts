import TicktickClient from "../../../services/ticktick";
import ticktick_task from "../../inbox/models/ticktick_task";

export default class Ticktick {
  private readonly client: TicktickClient;

  constructor(client: TicktickClient) {
    this.client = client;
  }

  async getCompletedTasks(after: Date): Promise<ticktick_task[]> {
    const { data, status } = await this.client.getAllCompletedTasks(after);
    if (status == 200) {
      return (data as any[])
        .map((item) => ({
          id: item.id,
          done: item.status == 2,
          source: "ticktick",
          parent: item.projectId,
          tags: item.tags || [],
          title: item.title,
        }))
        .filter((d) => d.done) as ticktick_task[];
    } else return [];
  }
}
