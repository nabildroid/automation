import axios, { AxiosInstance } from "axios";
import md5 from "md5";
import { dateFormat } from "../core/utils";

const BASEURL = "https://api.ticktick.com/api/v2";

enum API {
  STATUS = "/user/status",
  LOGIN = "/user/signin",
  TASK_GET = "/task/",
  TASK_COMPLEYED = "/project/all/completedInAll/",
  STATISTICS_GENERAL = "/statistics/general",
  BATCH_TASKS = "/batch/task",
}

export default class TicktickClient {
  private client!: AxiosInstance;

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

      if (response.status == 200) {
        console.log("login success");
        return response.data.token;
      } else {
        throw Error();
      }
    } catch (e) {
      console.error(e);
      throw Error(`invalide email ${email} or password`);
    }
  }

  getTask(taskId: string, projectId: string) {
    return this.client.get(API.TASK_GET + taskId, {
      params: {
        projectId,
      },
    });
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
      update: tasks.map(createTask),
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
};

function createTask(task: OptionalTaskParameters) {
  return {
    assignee: null,
    attachments: [],
    columnId: "",
    commentCount: 0,
    content: task.content || "",
    createdTime: (task.created || new Date()).toISOString(),
    creator: null,
    dueDate: task.due?.toISOString() || null,
    etag: "",
    exDate: [],
    focusSummaries: [],
    id: task.id ?? "",
    isAllDay: false,
    isFloating: false,
    isCalendarNew: false,
    items: [],
    kind: "TEXT",
    modifiedTime: new Date().toISOString(),
    priority: task.priority ?? 0,
    progress: task.progress ?? 0,
    projectId: task.project ?? null,
    reminder: "",
    reminders: [],
    repeatFrom: "",
    repeatTaskId: task.id ?? "",
    sortOrder: -22265100412464,
    startDate: null,
    status: task.status ?? 0,
    tags: task.tags ?? [],
    timeZone: "Africa/Algiers",
    title: task.title,
  };
}
