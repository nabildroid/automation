import axios, { AxiosInstance } from "axios";

const BASEURL = "https://api.ticktick.com/api/v2";

enum API {
	STATUS = "/user/status",
	LOGIN = "/user/signin",
	GET_TASK = "/task/",
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
		return this.client.get(API.GET_TASK + taskId, {
			params: {
				projectId,
			},
		});
	}
}
