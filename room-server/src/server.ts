import express, {Express} from "express";
import cors from "cors";
import {SocketService} from "./socket";

const app: Express = express();

const port: number = Number(process.env.PORT) || 3001;

app.set("port", port);
app.use(cors());

const server = app.listen(port, () => {
  console.log(`Server is listening on port:${port}`);
});

// socket
new SocketService(server);
