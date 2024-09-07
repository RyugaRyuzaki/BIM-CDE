import {Request, Response, NextFunction} from "express";
import {projects} from "../db/schema";
import {BaseController} from "./BaseController";
import {configRedis, db, redisClient} from "../db";
import {forbidden} from "../config/ErrorHandler";
import {eq} from "drizzle-orm";
import {WithAuthProp} from "@clerk/clerk-sdk-node";

export const getUserInfo = async (userId: string) => {
  return await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    with: {
      models: true,
    },
  });
};

export class ProjectController extends BaseController<
  typeof projects.$inferInsert
> {
  create = async (
    req: WithAuthProp<Request>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {sessionId, userId} = req.auth;
      const {projectName, address} = req.body;
      if (!projectName || !address || !userId)
        return next(forbidden("Missing Project name or address"));
      await this.db
        .insert(projects)
        .values({name: projectName, address, userId})
        .returning({id: projects.id});

      const userProjects = await getUserInfo(userId);
      await redisClient.set(
        sessionId,
        JSON.stringify(userProjects),
        configRedis
      );
      res.status(200).json({projects: userProjects});
    } catch (error: any) {
      console.log(error);
      next(error);
    }
  };
  read = async (
    req: WithAuthProp<Request>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {sessionId, userId} = req.auth;
      if (!sessionId || !userId) {
        next({statusCode: 403, message: "Unauthorized!"});
        return;
      }
      const data = await redisClient.get(sessionId!);
      if (!data) {
        const userProjects = await getUserInfo(userId);
        await redisClient.set(
          sessionId,
          JSON.stringify(userProjects),
          configRedis
        );
        res.status(200).json({projects: userProjects});
        return;
      }
      res.status(200).json({projects: JSON.parse(data)});
    } catch (error) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {};
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error: any) {
      next(error);
    }
  };
  bulkInsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
    } catch (error: any) {
      next(error);
    }
  };
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id} = req.params;
      res.status(200).json({
        id,
      });
    } catch (error: any) {
      next(error);
    }
  };
  findByDynamicQuery = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
    } catch (error: any) {
      next(error);
    }
  };
}
export const projectController = new ProjectController(db);
