import {Request, Response, NextFunction} from "express";
import multer from "multer";
import {Worker} from "worker_threads";

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
      const {projectId} = req.body;
      if (!projectId)
        return next({
          statusCode: 403,
          message: "Missing Data",
        });
      try {
        const {buffer} = req.file;

        const worker = new Worker("./IfcWorker.ts", {workerData: 1000000});
        worker.on("message", (msg) => {
          console.log(msg);
        });
        worker.on("error", (err) => console.error(err));

        return res.status(200).json({
          length: buffer.length,
          message: "Server received, this parser process takes few minutes!",
        });
      } catch (error) {
        next(error);
      }
    });
  };
}
