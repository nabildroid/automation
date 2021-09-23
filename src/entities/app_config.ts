interface AuthServices {
	notion: string;
	ticktick: string;
}

export default interface AppConfig {
	title:string,
	auth: AuthServices;
}
