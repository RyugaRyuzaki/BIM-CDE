import AWS from "aws-sdk";
const configAWS = {
  s3ForcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_KEY_ID || "",
  },
  region: process.env.AWS_REGION || "",
  endpoint: process.env.AWS_HOST || "",
  apiVersions: {
    s3: "2006-03-01",
  },

  logger: process.stdout,
};
//@ts-ignore
AWS.config.update(configAWS);

export const awsClient = new AWS.S3();
export async function uploadSmall(
  awsClient: AWS.S3,
  data: any,
  bucketName: string,
  fullPath: string,
  mimetype: string
) {
  await awsClient
    .upload({
      Bucket: bucketName,
      ACL: "public-read-write",
      Key: fullPath,
      Body: data,
      ContentType: mimetype,
      StorageClass: "STANDARD",
    })
    .promise();
}
