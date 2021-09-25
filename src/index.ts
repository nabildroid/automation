import Express from "express";
import App from "./app";
import admin from "firebase-admin";

require("dotenv").config();
const port = process.env.PORT || 8080;
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT || "{}");
const authorization = process.env.AUTHORIZATION;

const server = Express();
server.use(Express.json());

server.use((req, _, next) => {
	if (!authorization || req.headers.authorization == authorization) {
		next();
	}
});

const app = new App(server);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

server.listen(port, async () => {
	console.log(`listening on port ${port} `);

	app.init(admin.firestore());
});
