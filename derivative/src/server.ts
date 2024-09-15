import os from "os";
import express, {Express, Request, Response, NextFunction} from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import {Parser} from "./parser";

const app: Express = express();
const port = process.env.PORT;
app.set("port", port);
morgan.token("ram", function (req, res) {
  const freeMemory = os.freemem();
  const totalMemory = os.totalmem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);
  return `${usedMemory} bytes (${memoryUsagePercentage}%) used out of ${totalMemory} bytes`;
});
app.use(
  morgan(":method :url :status :response-time ms - :remote-addr - RAM: :ram")
);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false, limit: "50mb"}));
app.use(bodyParser.json({limit: "1024mb"}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/api/v1/derivative", Parser.ifcParser);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message;
  res.status(errStatus).json({
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port:${port}`);
});
