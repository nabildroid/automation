import Express from "express";
import App from "./app";
import admin from "firebase-admin";
import { EventEmitter } from "events";
import fs from "fs";
import Winston from "winston"

import {LoggingWinston}  from '@google-cloud/logging-winston';


const loggingWinston = new LoggingWinston({
  projectId:"supernabil-86c2b",
});


const logger = Winston.createLogger({
  defaultMeta:{
    project:"supernabil heroku",
  },
  transports: [
    new Winston.transports.Console(),
    loggingWinston,
  ],
});




require("dotenv").config();
const port = process.env.PORT || 8080;
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT || "{}");
const authorization = process.env.AUTHORIZATION;


const server = Express();
server.use(Express.json());

server.use((req, res, next) => {
  if (!authorization || req.headers.authorization == authorization) {
    next();
  } else {
    res.redirect("https://laknabil.notion.site");
  }
});

const app = new App(server,logger);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });


fs.writeFileSync(".service_account.js",JSON.stringify(serviceAccount));
process.env.GOOGLE_APPLICATION_CREDENTIALS  = ".service_account.js";





const storage = admin.storage();
const bucket = storage.bucket(process.env.BUCKET);

export const bus = new EventEmitter();


const timer = logger.startTimer();
server.listen(port, async () => {
  console.log(`listening on port ${port} `);

  await app.init(admin.firestore(), bucket);

  timer.done({message:"Init App"});
});
