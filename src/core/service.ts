import { Router } from "express";

import { Response, Request } from "express";
import winston from "winston";

export interface IRoute {
  handler: (
    req: Request,
    res: Response,
    logger?: winston.Logger
  ) => Promise<any>;
}

export type RouteConfig = [method: "get" | "post", path: string, route: IRoute];

export default class Service {
  protected configRoutes(
    routes: RouteConfig[],
    route: Router,
    logger?: winston.Logger
  ) {
    routes.forEach((config) => {
      const handler = config[2]!.handler.bind(config[2]);

      const watch_handler = async (req: any, res: any) => {
        const timer = logger?.startTimer();
        try {
          await handler(
            req,
            res,
            logger?.child({
              route: config[1],
            })
          );

          timer?.done({ message: config[1] });
        } catch (e) {
          logger?.error(config[1]);
        }
      };

      if (config[0] == "get") {
        route.get(config[1], watch_handler);
      } else if (config[0] == "post") {
        route.post(config[1], watch_handler);
      }
    });
  }
}
