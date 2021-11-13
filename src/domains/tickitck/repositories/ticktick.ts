import TicktickClient, {
  tickitckToDateformat,
} from "../../../services/ticktick";
import GeneralStats from "../models/general_stats";
import habit, { habitCheckIn } from "../models/habit";
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
