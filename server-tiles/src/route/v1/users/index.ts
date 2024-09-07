import express, {NextFunction, Request, Response, Router} from "express";
import bodyParser from "body-parser";
import {configRedis, redisClient, svixWh} from "../../../db";
import {getUserInfo} from "../../../controller";

const whType: Set<string> = new Set([
  "user.deleted",
  "session.created",
  "session.ended",
  "session.removed",
]);

// /api/v1/users
const route = Router();

// clerk webhooks
route.use(
  bodyParser.raw({type: "application/json"}),
  express.raw({type: "application/json"})
);
route.post("", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payloadString = req.body.toString();

    const svixHeaders = req.headers as Record<string, string>;

    const evt = svixWh.verify(payloadString, svixHeaders) as any;

    const type = evt.type as string;

    const userId = evt.data.user_id;

    const sessionId = evt.data.id;

    if (!type || !whType.has(type))
      return next({statusCode: 403, message: "can not find event"});
    if (type === "session.removed") {
      await redisClient.del(sessionId);
    } else if (type === "user.deleted") {
      ///
    } else {
      const userProjects = await getUserInfo(userId);

      await redisClient.set(
        sessionId,
        JSON.stringify(userProjects),
        configRedis
      );
    }

    res.status(200).json(sessionId);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default route;
