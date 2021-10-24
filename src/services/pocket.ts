const crypto = require("crypto");
const qs = require("qs");

import axios, { AxiosInstance } from "axios";
import PocketArticle from "../entities/pocket_article";

export default class PocketClient {
  private client!: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: "https://api.getpocket.com",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-accept": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const { nonce, signature, time } = sign(accessToken);
      if (config.method == "post") {
        config.data["access_token"] = accessToken;
        config.data["oauth_timestamp"] = time;
        config.data["oauth_nonce"] = nonce;
        config.data["sig_hash"] = signature;
        config.data["consumer_key"] = process.env.POCKET_CONSUMER;
        config.data = qs.stringify(config.data);
      }

      return config;
    });
  }

  async getArticles(since = 1635102769) {
    try {
      const response = await this.client.post("/v3/get", {
        since,
        annotations: 1,
      });
      if (response.status != 200) return [];
      const list = Object.values<any>(response.data["list"]);

      return list
        .filter((i) => i["status"] != "2")
        .map((item) => ({
          id: item["item_id"],
          completed: item["status"] == "1",
          created: new Date(parseInt(item["time_added"]) * 1000),
          updated: new Date(parseInt(item["time_updated"]) * 1000),
          read:
            item["time_read"] == "0"
              ? null
              : new Date(parseInt(item["time_read"]) * 1000),
          title: item["resolved_title"] || "",
          url: item["resolved_url"] || "",
          summary: item["excerpt"] || "",
          wordCount: parseInt(item["word_count"]),
          duration: parseInt(item["time_to_read"]),
          language: item["lang"] || "",
          topImage: item["top_image_url"] || "",
          tags: Object.keys(item["tags"] || {}),
          images: Object.values<any>(item["images"] || {}).map((i) => i["src"]),
          highlights: ((item["annotations"] as any[]) || []).map((a) => ({
            id: a["annotation_id"],
            text: a["quote"],
            version: parseInt(a["version"]),
            created: new Date(parseInt(a["created_at"]) * 1000),
          })),
        })) as PocketArticle[];
    } catch (e) {
      return [];
    }
  }
}

function sign(access_token: string) {
  // a hacker can actually prescibe a remedy for every problem
  // the thing is, why you gave Readwise an exclusive access to the highlights API !!!!
  const suffix = "It will take more than a doctor to prescribe a remedy";
  // todo use random nonce
  const nonce = "V1WPiCWviJM6bdYd"; // random 16 characters
  const time = Date.now();
  const key = time + nonce + access_token + suffix;

  const bytes = Buffer.from(key, "binary");
  const hash = md5(bytes);
  const signature = bitWise(hash);

  return {
    signature: signature.toString(),
    time,
    nonce,
  };
}

function md5(bytes: Buffer) {
  return crypto.createHash("md5").update(bytes).digest();
}

function bitWise(bArr: Buffer) {
  const chars = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102,
  ];

  const cArr = Buffer.alloc(bArr.length * 2);

  let i2 = 0;

  for (const b of bArr) {
    let i3 = i2 + 1;
    cArr[i2] = chars[(b >> 4) & 15];
    i2 = i3 + 1;
    cArr[i3] = chars[b & 15];
  }

  return cArr;
}
