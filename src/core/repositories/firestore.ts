import { firestore } from "firebase-admin";
import AppConfig from "../entities/app_config";

const CONFIG = "/general/config";

export default class Firestore {
  private readonly client: firestore.Firestore;
  constructor(client: firestore.Firestore) {
    this.client = client;
  }

  async appConfig(): Promise<AppConfig> {
    const doc = await this.client.doc(CONFIG).get();
    const config = doc.data();
    if (config) {
      return this.validateConfig(config);
    } else {
      throw Error(
        `application configuration doesn't exists in the provided database, path(${CONFIG}) is empty`
      );
    }
  }

  private validateConfig(config: any): AppConfig {
    // todo validate and create a default configuration
    if (!(config as AppConfig).ticktickConfig.password) {
      config.ticktickConfig.password = process.env.TICKTICK_DEFAULT_PASSWORD;
    }

    return config;
  }
}