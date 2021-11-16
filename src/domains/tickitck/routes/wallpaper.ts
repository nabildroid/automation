import { json, Request, Response } from "express";
import { IRoute } from "../../../core/service";
import habit, { habitCheckIn } from "../models/habit";
import Ranking from "../models/ranking";
import Firestore from "../repositories/firestore";
import Ticktick from "../repositories/ticktick";

export default class Wallpaper implements IRoute {
  ticktick: Ticktick;
  db: Firestore;
  constructor(ticktick: Ticktick, db: Firestore) {
    this.ticktick = ticktick;
    this.db = db;
  }

  async handler(req: Request, res: Response) {
    const ranks = await this.db.getRanking();
    const weeks = this.combineRanksInWeeks(ranks);
    const scores = this.computeWeeksScore(weeks);

    const allHabits = await this.ticktick.getHabits();
    const habits = allHabits.filter((h) => h.active);

    const habitCheckins = await this.ticktick.getHabitCheckIn(
      this.getWeekStartDay(),
      habits.map((h) => h.id)
    );
    
    let sum = this.computeHabitSumValueGoalRatio(habitCheckins);
    sum = this.appendMissingDaysToHabitCheckIns(sum, habits);

    const averange = Object.values(sum).map((item) => {
      return item.reduce((acc, v) => acc + v, 0) / item.length;
    });

    const result = {
      weeks: scores.map(v=>v.toFixed(4)),
      habits: averange.map(v=>v.toFixed(4)),
      start: ranks[0]?.date || null,
      productivity: Math.floor(ranks.pop()?.ranking || 0),
    };

    res.send(JSON.stringify(result));
  }

  computeHabitSumValueGoalRatio(habitCheckIns: habitCheckIn[]) {
    return habitCheckIns.reduce<{ [k: string]: number[] }>((acc, v) => {
      if (!acc[v.habitId]) {
        acc[v.habitId] = [];
      }

      acc[v.habitId].push(v.value / v.goal);
      return acc;
    }, {});
  }

  appendMissingDaysToHabitCheckIns(
    sum: { [k: string]: number[] },
    habits: habit[]
  ) {
    Object.entries(sum).forEach(([key, value]) => {
      const expectedDays = habits.find((h) => h.id == key)!.days;
      const missing = Math.max(expectedDays.length - value.length, 0);

      for (let i = 0; i < missing; i++) {
        sum[key].push(0);
      }
    });

    habits.forEach((h) => {
      if (!sum[h.id]) {
        sum[h.id] = [0];
      }
    });

    return sum;
  }

  getWeekStartDay() {
    const now = new Date();
    return new Date(now.setDate(now.getDate() - now.getDay() - 5  ));
  }

  computeWeeksScore(weeks: Ranking[][]) {
    const scores = weeks
      .reduce<number[]>(
        (acc, v) => [
          ...acc,
          Math.abs((v.shift()?.score || 0) - (v.pop()?.score || 0)),
        ],
        []
      )
      .filter((v) => v);

    const max = scores.reduce((acc, v) => (acc > v ? acc : v), 0);
    const normalize = scores.map((s) => s / max);

    return normalize;
  }

  combineRanksInWeeks(ranks: Ranking[]) {
    ranks.sort((a, b) => a.date.getTime() - b.date.getTime());

    const weeks: Ranking[][] = [[]];

    let prevDays = new Set();
    ranks.forEach((rank) => {
      if (prevDays.has(rank.date.getDay())) {
        weeks.push([]);
        prevDays = new Set();
      }
      prevDays.add(rank.date.getDay());

      weeks[weeks.length - 1].push(rank);
    });

    return weeks.filter((week) => week.length > 1);
  }
}
