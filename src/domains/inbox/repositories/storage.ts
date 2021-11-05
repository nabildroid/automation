import { Bucket } from "@google-cloud/storage";
import md5 from "md5";

export default class Storage {
  private readonly client: Bucket;

  constructor(client: Bucket) {
    this.client = client;
  }

  async addScreenshot(localpath: string): Promise<string> {
    // todo use Image Meteta data to identify the image mime and Name
    const tempFileName =
      md5(localpath + Date.now() + process.env.AUTHORIZATION) + ".png";

    const file = await this.client.upload(localpath, {
      public: true,
      contentType: "image/png",
      destination: "screenshots/" + tempFileName,
    });

    return file[0].publicUrl();
  }
}
