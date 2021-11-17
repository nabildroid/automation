import axios, { AxiosInstance } from "axios";

const BASEURL = "https://api.twitter.com/2";

enum API {
  TWEET = "/tweets",
  SEARCH = "/tweets/search/recent",
}

export default class TwitterClient {
  private client!: AxiosInstance;

  constructor(auth: string) {
    this.client = axios.create({
      baseURL: BASEURL,
      headers: {
        "Authorization": `Bearer ${auth}`,
      },
    });
  }

  getTweet(id: string) {
    return this.client.get(API.TWEET, {
      params: {
        ids:id,
        expansions: "author_id,attachments.media_keys",
        "tweet.fields": "referenced_tweets,context_annotations,withheld",
        "media.fields": "url,alt_text",
      },
    });
  }

  search(query: string, max_results: number = 100) {
    return this.client.get(API.SEARCH, {
      params: {
        query,
        expansions: "author_id,attachments.media_keys",
        "tweet.fields": "referenced_tweets,context_annotations,withheld",
        "media.fields": "url,alt_text",
        max_results,
      },
    });
  }
}
