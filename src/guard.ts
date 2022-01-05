import { Request } from "express";

export function needAuthorization(req: Request): boolean {
  return req.path.includes("/ticktick/tasks/default");
}
