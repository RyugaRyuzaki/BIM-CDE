import {Request, Response, NextFunction} from "express";
import multer from "multer";
import {ParserManager} from "./ParserManager";

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
export class Parser {
  static ifcParser = (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, async (err: any) => {
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
      if (!req.file) {
        console.log("err");

        return next({statusCode: 403, message: "File not found"});
      }
      const {projectId, token} = req.body;
      if (!projectId || !token)
        return next({
          statusCode: 403,
          message: "Missing Data",
        });
      try {
        const {buffer, originalname} = req.file;
        new ParserManager().streamModel(buffer, originalname, projectId, token);
        return res.status(200).json({
          length: buffer.length,
          message: token,
        });
      } catch (error) {
        next(error);
      }
    });
  };
}
