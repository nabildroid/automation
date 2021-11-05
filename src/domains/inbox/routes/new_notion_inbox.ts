import { Request, Response } from "express";
import { IRoute } from "../../../core/service";
import Notion from "../repositories/notion";

export default class NewNotionInbox implements IRoute {
  notion: Notion;
  constructor(notion: Notion) {
    this.notion = notion;
  }

  async handler(req: Request, res: Response) {
    const note = (req.body.note as string).trim();
    const lines = note.split("\n");
    const title = lines.shift() as string;
    const body = lines.length ? lines.join("\n") : undefined;
    // todo add hashtags and MD5 to Notion childrens

    const { id } = await this.notion.addToInbox(title, body);

    res.send(
      `new note has been saved in your inbox at https://notion.so/${id}`
    );
  }
}
