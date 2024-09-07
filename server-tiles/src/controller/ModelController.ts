import {Request, Response, NextFunction} from "express";
import {BaseController} from "./BaseController";
import {configRedis, db, redisClient} from "../db";
import {forbidden} from "../config/ErrorHandler";
import {WithAuthProp} from "@clerk/clerk-sdk-node";
import {models} from "../db/schema";
import {getUserInfo} from "./ProjectController";

export class ModelController extends BaseController<
  typeof models.$inferInsert
> {
  create = async (
    req: WithAuthProp<Request>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {sessionId, userId} = req.auth;
      const {name, projectId, versionId} = req.body;
      if (!name || !projectId || !userId || !versionId)
        return next(forbidden("Missing Model name or projectId"));
      await this.db
        .insert(models)
        .values({name, projectId, versionId})
        .returning({id: models.id});

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
  ) => {};
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
export const modelController = new ModelController(db);
