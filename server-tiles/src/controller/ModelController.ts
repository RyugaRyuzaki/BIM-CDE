import multer from "multer";
import {Request, Response, NextFunction} from "express";
import {BaseController} from "./BaseController";
import {configRedis, db, redisClient} from "../db";
import {WithAuthProp} from "@clerk/clerk-sdk-node";
import {getUserInfo} from "./ProjectController";
import {awsClient, uploadSmall} from "../config/AWS3";
import {models, Properties} from "../db/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldNameSize: 1000,
    fileSize: 2 * 1024 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/octet-stream" ||
      file.mimetype === "application/json"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Error mimetype"));
    }
  },
});

export class ModelController extends BaseController<
  typeof models.$inferInsert
> {
  create = async (
    req: WithAuthProp<Request>,
    res: Response,
    next: NextFunction
  ) => {};
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
  uploadFiles = (
    req: WithAuthProp<Request>,
    res: Response,
    next: NextFunction
  ) => {
    upload.array("files")(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code == "LIMIT_FILE_SIZE") {
          err.message = "Limit size is" + 4 + "GB";
          //@ts-ignore
          err.statusCode = 405;
        }
        console.log(err);
        return next(err);
      } else if (err) {
        console.log(err);
        return next(err);
      }
      if (!req.files) {
        console.log("err");

        return next({statusCode: 403, message: "File not found"});
      }
      const {sessionId, userId} = req.auth;
      const {projectId, modelId, name} = req.body;
      if (!projectId || !modelId || !name || !userId)
        return next({
          statusCode: 403,
          message: "Missing Data",
        });
      try {
        await Promise.all(
          //@ts-ignore
          req.files.map(async (file) => {
            const {buffer, originalname, mimetype} = file;
            return await uploadSmall(
              awsClient,
              buffer,
              projectId,
              `${modelId}/${originalname}`,
              mimetype
            );
          })
        );
        await this.db
          .insert(models)
          .values({name, projectId, id: modelId})
          .returning({id: models.id});

        const userProjects = await getUserInfo(userId);
        await redisClient.set(
          sessionId,
          JSON.stringify(userProjects),
          configRedis
        );
        return res.status(200).json({length: 10});
      } catch (error) {
        next(error);
      }
    });
  };
  properties = async (req: Request, res: Response, next: NextFunction) => {
    const {properties} = req.body;
    if (!properties)
      return next({
        statusCode: 403,
        message: "Missing Data",
      });
    if (!Array.isArray(properties))
      return next({
        statusCode: 403,
        message: "Wrong data type",
      });
    const propArray: {
      modelId: string;
      name: string;
      data: {[id: number]: any};
    }[] = properties;
    try {
      await Properties.insertMany(propArray);
      return res.status(200).json({length: 10});
    } catch (error) {
      next(error);
    }
  };
  getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {modelId, name} = req.params;
      if (!modelId || !name)
        return next({
          statusCode: 403,
          message: "Missing params",
        });
      if (typeof modelId !== "string" || typeof name !== "string")
        return next({
          statusCode: 403,
          message: "Wrong data type",
        });
      const props = await Properties.findOne({modelId, name});
      return res.status(200).json(props?.data);
    } catch (error) {
      next(error);
    }
  };
}
export const modelController = new ModelController(db);
