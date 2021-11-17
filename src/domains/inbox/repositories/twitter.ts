import TwitterClient from "../../../services/twitter";
import Tweet from "../models/tweet";

export default class Twitter {
  client: TwitterClient;

  constructor(client: TwitterClient) {
    this.client = client;
  }

  async thread(headId: string, maxRecursiveDeep: number = 2) {
    // BUG require refactoring!
    if (maxRecursiveDeep == 0) return [];

    const result: Tweet[] = [];

    const { data: tweets } = await this.client.getTweet(headId);

    if (!tweets.includes.users[0]) {
      throw new Error("unable to fetch the thread author");
    }

    const author = tweets.includes.users[0].id;

    const {
      data: [data],
      includes: { media, users },
    } = tweets;

    const images = data.attachments?.media_keys.map(
      (key) => media.find((m) => m.media_key == key)!.url
    );

    result.push({
      author: users[0].username,
      text: normalizeTweetText(data.text),
      image: images?.length ? images[0] : undefined,
      link: `https://twitter.com/${data.author_id}/status/${data.id}`,
    });

    const { data: thread } = await this.client.search(
      `from:${author} to:${author} conversation_id:${headId}`
    );
    const isRecentThread = thread.data?.length;

    if (isRecentThread) {
      const {
        data: items,
        includes: { media, users },
      } = thread;

      const parsedItems = await Promise.all(
        items.map<Promise<Tweet>>(async (tweet) => {
          const images = tweet.attachments?.media_keys.map(
            (key) => media.find((m) => m.media_key == key)!.url
          );
          const quoted = tweet.referenced_tweets?.filter(
            (r) => r.type == "quoted"
          )[0]?.id;

          return {
            author: users[0].username,
            text: normalizeTweetText(tweet.text),
            link: `https://twitter.com/${author}/status/${tweet.id}`,
            image: images ? images[0] : undefined,
            childrens:
              quoted && quoted != headId
                ? await this.thread(quoted, maxRecursiveDeep - 1)
                : undefined,
          };
        })
      );

      result.push(...parsedItems.reverse());
    }

    return result;
  }
}

function normalizeTweetText(text: string) {
  return text
    .replace(/\n\n/g, "\n")
    .replace(/https:\/\/t.co\/.{10}$/g, "")
    .replace(/\n$/g, "");
}
