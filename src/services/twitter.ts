import axios, { AxiosInstance } from "axios";

const BASEURL = "https://api.twitter.com/2";

enum API {
  TWEET = "/tweets",
  SEARCH = "/tweets/search/recent",
}

type TweetResponse = {
  data: {
    id: string;
    attachments?: {
      media_keys: string[];
    };
    text: string;
    author_id: string;
  }[];
  includes: {
    media: {
      media_key: string;
      type: "photo";
      url: string;
    }[];

    users: {
      id: string;
      name: string;
      username: string;
    }[];
  };
};

type SearchResponse = {
  data: {
    text: string;
    created_at: string;
    id: string;
    in_reply_to_user_id: string;
    referenced_tweets?: {
      type: "quoted" | "replied_to";
      id: string;
    }[];
    attachments?: {
      media_keys: string[];
    };
    context_annotations?: {
      domain: {
        id: string;
        name: string;
        description: string;
      };
      entity: { id: string; name: string; description?: string };
    }[];
    entities?: {
      urls: {
        start: number;
        end: number;
        url: string;
        expanded_url: string;
        display_url: string;
      }[];
    };
  }[];
  includes: {
    users: {
      id: string;
      name: string;
      username: string;
    }[];
    media: {
      media_key: string;
      type: "photo";
      url: string;
    }[];
  };
  meta: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
  };
};

export default class TwitterClient {
  private client!: AxiosInstance;

  constructor(auth: string) {
    this.client = axios.create({
      baseURL: BASEURL,
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    });
  }

  getTweet(id: string) {
    return this.client.get<TweetResponse>(API.TWEET, {
      params: {
        ids: id,
        expansions: "author_id,attachments.media_keys",
        "tweet.fields": "referenced_tweets,context_annotations,withheld",
        "media.fields": "url,alt_text",
      },
    });
  }

  search(query: string, max_results: number = 100) {
    return this.client.get<SearchResponse>(API.SEARCH, {
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
