import TicktickTask from "../../../core/entities/ticktick_task";
import TicktickClient, {
  tickitckToDateformat,
} from "../../../services/ticktick";
import GeneralStats from "../models/general_stats";
import habit, { habitCheckIn } from "../models/habit";
import Project from "../models/project";
import Ranking from "../models/ranking";

export default class Ticktick {
  private readonly client: TicktickClient;

  constructor(client: TicktickClient) {
    this.client = client;
  }

  async getTodayRanking(): Promise<Ranking> {
    const { data, status } = await this.client.getRanking();
    if (status == 200) {
      return {
        date: new Date(),
        completedCount: data.completedCount,
        dayCount: data.dayCount,
        level: data.level,
        projectCount: data.projectCount,
        ranking: data.ranking,
        score: data.score,
        taskCount: data.taskCount,
      };
    } else {
      throw new Error("unable to fetch the fetch ranking");
    }
  }

  async getHabits(): Promise<habit[]> {
    const { data } = await this.client.getHabits();
    return (data as any[]).map((item) => ({
      id: item["id"],
      name: item["name"],
      goal: item["goal"],
      active: item["status"] == 0,
      days: convertHabitRepeat(item["repeatRule"]),
    }));
  }

  async getHabitCheckIn(after: Date, ids: string[]): Promise<habitCheckIn[]> {
    const { data, status } = await this.client.getHabitsCheckin(after, ids);

    if (status == 200) {
      const { checkins } = data;
      const entities = Object.entries(checkins) as [String, any[]][];

      // todo refactor this
      return entities
        .map(([habitId, logs]) => [
          ...logs.map((log) => ({
            habitId,
            time: log["checkinTime"]
              ? new Date(log["checkinTime"])
              : tickitckToDateformat(log["checkinStamp"].toString()),
            goal: log["goal"],
            status: log["status"],
            value: log["value"],
          })),
        ])
        .flat() as habitCheckIn[];
    } else throw Error("unable to fetch habit checkins");
  }

  async getGeneralStatistis(): Promise<GeneralStats> {
    const { data, status } = await this.client.getGeneralStatistics();
    if (status == 200) {
      return {
        level: data.level,
        score: data.score,
        todayCompleted: data.todayCompleted,
        yesterdayCompleted: data.yesterdayCompleted,
        totalCompleted: data.totalCompleted,
        scoreByDay: data.scoreByDay,
        taskByDay: data.taskByDay,
      };
    } else throw Error("unable to fetch ticktick general statistics");
  }

  async addPomodoroTask(id: string, projectId: string, duration: number) {
    const task = await this.fetchRawTask(id, projectId);

    const focus = task?.focusSummaries?.shift() ?? {
      estimatedPomo: 0,
      pomoCount: 0,
      pomoDuration: 0,
      stopwatchDuration: 0,
      userId: this.client.userId,
    };

    const pomo = task?.pomodoroSummaries?.shift() ?? {
      userId: this.client.userId,
      count: 0,
      estimatedPomo: 0,
      duration: 0,
    };

    focus.pomoCount++;
    focus.pomoDuration += duration;
    pomo.pomoCount++;
    pomo.duration += Math.floor(duration / 60);

    const allProjects = await this.getProject();
    const thisProject = allProjects.find((p) => p.id == projectId)!;

    await this.client.updateTasks([
      {
        id,
        project: projectId,
        focus: [focus],
        pomoFocus: [pomo],
      },
    ]);

    await this.client.addPomodoro({
      taskId: id,
      tags: task.tags,
      taskTitle: task.title,
      start: new Date(Date.now()  - duration * 1000),
      end: new Date(),
      projectName: thisProject?.name,
    });
  }

  async getProject(): Promise<Project[]> {
    const { data, status } = await this.client.getProjects();
    // todo cache the projects
    if (status == 200) {
      return (data as any[]).map((p) => ({
        closed: p.closed ?? false,
        color: p.color,
        id: p.id,
        kind: p.kind,
        modifiedTime: new Date(p.modifiedTime),
        name: p.name,
      }));
    } else throw Error("unable to fetch ticktick projects");
  }

  async getDefaultTasks(): Promise<(TicktickTask & { created: Date })[]> {
    const { data, status } = await this.client.check();

    if (status == 200) {
      const tasks = [...data.syncTaskBean.update, ...data.syncTaskBean.add];
      return tasks.map((task) => ({
        body: "",
        id: task.id,
        created: new Date(task.modifiedTime),
        done: task.status == 2,
        parent: task.projectId,
        source: "ticktick",
        tags: task.tags,
        title: task.title,
      }));
    } else throw Error("unable to fetch ticktick default tasks AKA check");
  }

  private async fetchRawTask(id: string, projectId: string) {
    const { data, status } = await this.client.getTask(id, projectId);

    if (status == 200) {
      return data;
    } else throw Error("unable to fetch ticktick raw task");
  }
}

function convertHabitRepeat(value: string) {
  const map = value
    .split(";")
    .map((v) => v.split("="))
    .reduce<{ [k: string]: string }>(
      (acc, v) => ({
        ...acc,
        [v[0]]: v[1],
      }),
      {}
    );

  if (!map["BYDAY"]) {
    return [0, 1, 2, 3, 4, 5, 6];
  } else {
    const days = map["BYDAY"].split(",");
    // ticktick specific
    const daysMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

    return days.reduce<number[]>((acc, v) => {
      if (daysMap.includes(v)) {
        acc.push(daysMap.indexOf(v));
      }
      return acc;
    }, []);
  }
}
