import os from "os";
import express, {Express} from "express";
import {LooseAuthProp} from "@clerk/clerk-sdk-node";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import {ErrorHandler} from "./config/ErrorHandler";
import {dbConnect} from "./db";
import route from "./route";

// define clerk type
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

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
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use("/api", route);
app.use(ErrorHandler);
dbConnect().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port:${port}`);
  });
});
