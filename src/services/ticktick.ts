import axios, { AxiosInstance } from "axios";
import md5 from "md5";
import { dateFormat } from "../core/utils";

const BASEURL = "https://api.ticktick.com/api";

enum API {
  STATUS = "/v2/user/status",
  LOGIN = "/v2/user/signin",
  TASK_GET = "/v2/task/",
  TASK_COMPLEYED = "/v2/project/all/completedInAll/",
  STATISTICS_GENERAL = "/v2/statistics/general",
  BATCH_TASKS = "/v2/batch/task",
  BATCH_POMODORO = "/v2/batch/pomodoro",
  RANKING = "/v3/user/ranking",
  HABITS = "v2/habits",
  HABITS_CHECKIN = "/v2/habitCheckins/query",
  PROJECTS = "/v2/projects",
  CHECK = "v2/batch/check/0",
}

export default class TicktickClient {
  private client!: AxiosInstance;

  userId!: string;

  constructor(
    email: string,
    password: string,
    saveAuth: (auth: string) => void,
    { auth }: { auth?: string } = {}
  ) {
    // FIXME resolve this mess
    if (!auth) {
      this.login(email, password).then((auth) => {
        saveAuth(auth);
        this.initClient(auth);
      });
    } else {
      this.initClient(auth);

      this.validateAuth().then((isValide) => {
        if (!isValide) {
          this.login(email, password).then((auth) => {
            saveAuth(auth);
            this.initClient(auth);
          });
        } else console.log("auth is valide");
      });
    }
  }

  private initClient(auth: string) {
    this.client = axios.create({
      baseURL: BASEURL,
      headers: {
        cookie: `t=${auth}`,
      },
    });
  }

  private async validateAuth(): Promise<boolean> {
    console.log("validating the auth");
    try {
      const response = await this.client.get(API.STATUS);
      this.userId = response.data.userId; // todo refactor this!
      return response.status == 200;
    } catch (e) {
      return false;
    }
  }

  private async login(email: string, password: string): Promise<string> {
    console.log("logging ...");
    try {
      const response = await axios.post(
        BASEURL + API.LOGIN,
        {
          username: email,
          password,
        },
        {
          params: {
            wc: true,
            remember: true,
          },
        }
      );

      console.log("login success");
      return response.data.token;
    } catch (error) {
      throw new Error(`invalide email ${email} or password`);
    }
  }

  getTask(taskId: string, projectId: string) {
    return this.client.get(API.TASK_GET + taskId, {
      params: {
        projectId,
      },
    });
  }

  getRanking() {
    return this.client.get(API.RANKING);
  }

  getGeneralStatistics() {
    return this.client.get(API.STATISTICS_GENERAL);
  }

  getAllCompletedTasks(after: Date) {
    return this.client.get(API.TASK_COMPLEYED, {
      params: {
        from: dateFormat(after),
        to: "",
      },
    });
  }

  getHabits() {
    return this.client.get(API.HABITS);
  }

  getHabitsCheckin(after: Date, ids: string[]) {
    console.log(dateToTicktickFormat(after));
    return this.client.post(API.HABITS_CHECKIN, {
      afterStamp: dateToTicktickFormat(after),
      habitIds: ids,
    });
  }

  createTasks(tasks: (OptionalTaskParameters & { title: string })[]) {
    return this.client.post(API.BATCH_TASKS, {
      add: tasks
        .map(createTask)
        .map((e) => ({ ...e, id: TicktickClient.randomTaskId() })),
      addAttachments: [],
      delete: [],
      deleteAttachments: [],
      update: [],
      updateAttachments: [],
    });
  }

  updateTasks(
    tasks: (OptionalTaskParameters & { project: string; id: string })[]
  ) {
    return this.client.post(API.BATCH_TASKS, {
      update: tasks.map(updateTask),
      addAttachments: [],
      delete: [],
      deleteAttachments: [],
      add: [],
      updateAttachments: [],
    });
  }

  deleteTasks(tasks: { taskId: string; projectId: string }[]) {
    return this.client.post(API.BATCH_TASKS, {
      update: [],
      addAttachments: [],
      delete: tasks,
      deleteAttachments: [],
      add: [],
      updateAttachments: [],
    });
  }

  addPomodoro(pomodoro: Omit<Pomodoro, "id">) {
    const pomo = createPomodoro({
      ...pomodoro,
      id: TicktickClient.randomTaskId(),
    });

    this.client.post(API.BATCH_POMODORO, {
      add: [pomo],
    });
  }

  getProjects() {
    return this.client.get(API.PROJECTS);
  }

  check() {
    return this.client.get(API.CHECK);
  }

  static parseTaskUrl(url: string) {
    // todo check the url validity
    const parts = url.split("/");
    const taskId = parts.pop();
    parts.pop(); // == "tasks"
    const list = parts.pop();

    if (!taskId || !list) throw Error("Unvalide Ticktick Task Url");

    return {
      taskId,
      list,
    };
  }

  static randomTaskId() {
    return md5((Date.now() + Math.random()).toString()).slice(0, 24);
  }
}

/**
 focusSummaries: [{estimatedDuration: 0, estimatedPomo: 10, userId: 117367344, pomoCount: 0, pomoDuration: 0,…}]
0: {estimatedDuration: 0, estimatedPomo: 10, userId: 117367344, pomoCount: 0, pomoDuration: 0,…}
estimatedDuration: 0
estimatedPomo: 10
pomoCount: 0
pomoDuration: 0
stopwatchDuration: 0
userId: 117367344
 */

type OptionalTaskParameters = {
  title?: string;
  created?: Date;
  due?: Date;
  priority?: number;
  progress?: number; // 0 -> 100
  project?: string;
  status?: number;
  tags?: string[];
  content?: string;
  id?: string;
  focus?: TaskFocus[];
  pomoFocus?: PomoFocus[];
};

type TaskFocus = {
  estimatedDuration?: number;
  estimatedPomo?: number;
  pomoCount?: number;
  pomoDuration?: number;
  stopwatchDuration?: number;
  userId?: number;
};

type PomoFocus = {
  userId: 117367344;
  count: number;
  estimatedPomo: number;
  duration: number;
};

function createPomodoro(pomodoro: Pomodoro) {
  return {
    local: pomodoro.local ?? true,
    id: pomodoro.id,
    startTime: dateTicktickPomodoroFormat(pomodoro.start),
    status: pomodoro.status ?? 1,
    endTime: dateTicktickPomodoroFormat(pomodoro.end),
    taskId: pomodoro.taskId,
    tasks: [
      {
        taskId: pomodoro.taskId,
        title: pomodoro.taskTitle,
        tags: pomodoro.tags,
        projectName: pomodoro.projectName,
        startTime: dateTicktickPomodoroFormat(pomodoro.start),
        endTime: dateTicktickPomodoroFormat(pomodoro.end),
      },
    ],
  };
}

type Pomodoro = {
  local?: boolean;
  start: Date;
  end: Date;
  taskId: string;
  id: string;
  taskTitle: string;
  projectName: string;
  tags: string[];
  status?: number;
};

function updateTask(task: OptionalTaskParameters) {
  return {
    ...task,
    content: task.content || "",
    createdTime: (task.created || new Date()).toISOString(),
    dueDate: task.due?.toISOString() || null,
    focusSummaries: task.focus ?? [],
    id: task.id ?? "",
    modifiedTime: new Date().toISOString(),
    priority: task.priority ?? 0,
    progress: task.progress ?? 0,
    projectId: task.project ?? null,
    status: task.status ?? 0,
    tags: task.tags ?? [],
    title: task.title,
  };
}

function createTask(task: OptionalTaskParameters) {
  //todo refactor this!
  return {
    assignee: null,
    attachments: (task as any)["attachments"] ?? [],
    columnId: "",
    commentCount: 0,
    content: task.content || "",
    createdTime: (task.created || new Date()).toISOString(),
    creator: null,
    dueDate: task.due?.toISOString() || null,
    etag: "",
    exDate: (task as any)["exDate"] ?? [],
    focusSummaries: task.focus ?? [],
    id: task.id ?? "",
    isAllDay: false,
    isFloating: false,
    isCalendarNew: false,
    items: (task as any)["items"] ?? [],
    kind: (task as any)["kind"] ?? "TEXT",
    modifiedTime: new Date().toISOString(),
    priority: task.priority ?? 0,
    progress: task.progress ?? 0,
    projectId: task.project ?? null,
    reminder: (task as any)["reminder"] ?? "",
    reminders: (task as any)["reminders"] ?? [],
    repeatFrom: (task as any)["repeatFrom"] ?? "",
    repeatTaskId: task.id ?? "",
    sortOrder: -22265100412464,
    startDate: (task as any)["startDate"] ?? null,
    status: task.status ?? 0,
    tags: task.tags ?? [],
    timeZone: "Africa/Algiers",
    title: task.title,
  };
}

// convert date to format like 20211113
export function dateToTicktickFormat(date: Date) {
  const [year, day, month] = date.toLocaleDateString().split("/").reverse();

  return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("");
}

/** convert from 20210908 to 2021 09 08 */
export function tickitckToDateformat(str: string) {
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6);

  return new Date([year, month, day].join(" "));
}

function dateTicktickPomodoroFormat(date: Date) {
  return date.toISOString().replace("Z", "+0000");
}
