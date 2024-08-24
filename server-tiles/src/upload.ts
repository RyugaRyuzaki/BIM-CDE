import multer from "multer";
import {NextFunction, Request, Response} from "express";
import {awsClient, uploadSmall} from "./config/AWS3";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldNameSize: 300,
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

export class UploadFile {
  static uploadFiles = (req: Request, res: Response, next: NextFunction) => {
    upload.array("files")(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code == "LIMIT_FILE_SIZE") {
          err.message = "Limit size is" + 4 + "GB";
          //@ts-ignore
          err.statusCode = 405;
        }
        return next(err);
      } else if (err) {
        return next(err);
      }
      if (!req.files) {
        return next({statusCode: 403, message: "File not found"});
      }
      const {bucketName, prefix} = req.body;
      if (!bucketName || !prefix)
        return next({
          statusCode: 403,
          message: "missing BucketName or fileName",
        });
      try {
        await Promise.all(
          //@ts-ignore
          req.files.map(async (file) => {
            const {buffer, originalname, mimetype} = file;
            return await uploadSmall(
              awsClient,
              buffer,
              bucketName,
              `${prefix}/${originalname}`,
              mimetype
            );
          })
        );
        return res.status(200).json({length: req.files.length});
      } catch (error) {
        next(error);
      }
    });
  };
  static getBucketID = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {bucketName} = req.params;
    if (!bucketName)
      return next({statusCode: 401, message: "Missing Bucket Name"});
    try {
      const params = {
        Bucket: bucketName,
        Delimiter: "/", // Sử dụng dấu gạch chéo để phân tách các thư mục
      };
      const data = await awsClient.listObjectsV2(params).promise();
      //@ts-ignore
      const folders = data.CommonPrefixes.map((prefix) => prefix.Prefix);
      return res.status(200).json({folders});
    } catch (error) {
      next(error);
    }
  };
  static createBucket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {bucketName} = req.body;
    if (!bucketName)
      return next({statusCode: 401, message: "Missing Bucket Name"});
    try {
      const list = await awsClient.listBuckets().promise();
      const existed = list.Buckets?.find(
        (bucket: any) => bucket.Name === bucketName
      );
      if (existed) return next({status: 403, message: "Bucket is existed!"});
      const params: AWS.S3.CreateBucketRequest = {
        Bucket: bucketName,
        ACL: "public-read-write",
      };
      const cors = {
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedMethods: ["GET"],
              AllowedOrigins: ["*"],
              AllowedHeaders: ["*"],
              ExposeHeaders: ["*"],
              MaxAgeSeconds: 300,
            },
          ],
        },
      };
      const bucket = await awsClient.createBucket(params).promise();
      await awsClient.putBucketCors(cors).promise();
      return res.status(200).json(bucket);
    } catch (error) {
      next(error);
    }
  };
  static deleteBucket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {bucketName} = req.params;
    if (!bucketName)
      return next({statusCode: 401, message: "Missing Bucket Name"});
    try {
      const list = await awsClient.listBuckets().promise();
      const existed = list.Buckets?.find(
        (bucket: any) => bucket.Name === bucketName
      );
      if (!existed) return next({status: 404, message: "Bucket not found!"});
      const bucket = await awsClient
        .listObjectsV2({Bucket: bucketName})
        .promise();
      if (!bucket) return next({status: 404, message: "Bucket not found!"});
      if (bucket.Contents!.length > 0) {
        const params = {
          Bucket: bucketName,
          Delete: {
            Objects: bucket.Contents!.map((content) => ({Key: content.Key})),
            Quiet: false,
          },
        };
        //@ts-ignore
        await awsClient.deleteObjects(params).promise();
      }
      await awsClient.deleteBucket({Bucket: bucketName}).promise();
      return res.status(200).json(bucket);
    } catch (error) {
      next(error);
    }
  };
}
