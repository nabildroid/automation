interface AuthServices {
  notion: string;
  ticktick?: string;
  pocket: string;
  twitter:string;
}

export interface NotionConfig {
  inbox: string;
  journal: string;
  blog: string;
  flashcard: string;
}

export interface TicktickConfig {
  inbox: string;
  password: string;
  email: string;
}

export default interface AppConfig {
  title: string;
  auth: AuthServices;
  notionConfig: NotionConfig;
  ticktickConfig: TicktickConfig;
}
