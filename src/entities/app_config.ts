interface AuthServices {
	notion: string;
	ticktick?: string;
}

export interface NotionConfig {
	inbox: string;
	journal: string;
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
