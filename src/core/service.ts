import { Router } from "express";

import { Response, Request } from "express";

export  interface IRoute {
  handler: (req: Request, res: Response) => void;
}

export type RouteConfig = [method: "get" | "post", path: string, route: IRoute];

export default class Service {
  protected configRoutes(routes: RouteConfig[], route: Router) {
    routes.forEach((config) => {
      const handler = config[2]!.handler.bind(config[2]);
      if (config[0] == "get") {
        route.get(config[1], handler);
      } else if (config[0] == "post") {
        route.post(config[1], handler);
      }
    });
  }
}
