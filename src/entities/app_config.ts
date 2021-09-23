interface AuthServices {
	notion: string;
	ticktick: string;
}

export default interface AppConfig {
	auth: AuthServices;
}
