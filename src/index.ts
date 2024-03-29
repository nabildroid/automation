import fs from "fs";
import Express from "express";
import admin from "firebase-admin";
import Winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import { ErrorReporting } from "@google-cloud/error-reporting";

import { EventEmitter } from "events";

import App from "./app";
import { needAuthorization } from "./guard";

require("dotenv").config();

const port = process.env.PORT || 8080;
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT || "{}");
const authorization = process.env.SUPERNABIL_AUTHORIZATION;

admin.initializeApp(
  process.env.SERVICE_ACCOUNT
    ? { credential: admin.credential.cert(serviceAccount) }
    : undefined
);

if (process.env.SERVICE_ACCOUNT) {
  fs.writeFileSync(".service_account.js", JSON.stringify(serviceAccount));
  process.env.GOOGLE_APPLICATION_CREDENTIALS = ".service_account.js";
}

export const errors = new ErrorReporting({
  projectId: "supernabil-86c2b",
  reportMode: "always",
  serviceContext: {
    service: "supernabil heroku",
  },
});

const loggingWinston = new LoggingWinston({
  projectId: "supernabil-86c2b",
});

const logger = Winston.createLogger({
  defaultMeta: {
    project: "supernabil heroku",
  },
  transports: [new Winston.transports.Console(), loggingWinston],
});

const server = Express();
server.use(Express.json());

const storage = admin.storage();
const bucket = storage.bucket(process.env.BUCKET);

export const bus = new EventEmitter();

const app = new App(server, logger);

const timer = logger.startTimer();

const initialization = app
  .init(admin.firestore(), bucket)
  .then(() => {
    timer.done({ message: "Init App" });
  })
  .catch((error) => {
    errors.report(error);
  });

server.use(async (req, res, next) => {
  await initialization;
  const isPrivateRequest = needAuthorization(req);

  if (
    (isPrivateRequest && req.headers.authorization == authorization) ||
    !isPrivateRequest
  ) {
    next();
  } else {
    res.redirect("https://laknabil.me");
    logger.warn("unauthorized request to " + req.path);
  }
});

initialization.then(() => {
server.listen(port);
});

server.use(errors.express);
