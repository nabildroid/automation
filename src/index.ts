import Express from "express";

require("dotenv").config();
import App from "./app";

const server = Express();

const app = new App(server);

const port = process.env.PORT || 8080;
server.listen(port, () => {
	console.log(`listening on port ${port} `);
	app.init();
});
