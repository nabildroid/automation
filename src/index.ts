import Express from "express";
import App from "./app";
import admin from "firebase-admin";

require("dotenv").config();
const port = process.env.PORT || 8080;
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT || "{}");

const server = Express();
server.use(Express.json());

const app = new App(server);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

server.listen(port, async () => {
	console.log(`listening on port ${port} `);

	app.init(admin.firestore());
});
