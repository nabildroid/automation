import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Notion from "../repositories/notion";
import Twitter from "../repositories/twitter";

export default class SaveTweets implements IRoute {
  notion: Notion;
  twitter: Twitter;

  constructor(notion: Notion, twitter: Twitter) {
    this.notion = notion;
    this.twitter = twitter;
  }

  async handler(req: Request, res: Response) {
    let id = "";

    if (req.params.id) {
      id = req.params.id;
    } else if (req.body.url) {
      id = req.body.url.split("/").pop();
    }

    if (id.length < 5) throw new Error("invalide tweet id:" + id);

    const tweets = await this.twitter.thread(id);

    const head = tweets[0]!;

    await this.notion.addToInbox(
      {
        title: head.text.split("\n")[0],
        body: Notion.TweetsTemplate(tweets),
        done: false,
        tags: [],
      },
      {
        context: ["twitter"],
        source: head.link,
      }
    );
    
    console.log("saved");
    res.send(head.text.split("\n")[0]);
  }
}
