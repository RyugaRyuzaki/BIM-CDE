import {ZodError, z} from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  POSTGRES_HOST: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  DB_URL: z.string(),
  ACCESS_TOKEN: z.string(),
  EXP_ACCESS_TOKEN: z.string(),
  REFRESH_TOKEN: z.string(),
  EXP_REFRESH_TOKEN: z.string(),
  CLERK_WEBHOOK_SECRET_KEY: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
});
try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    error.issues.forEach((issue) => {
      message += issue.path[0] + "\n";
    });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);
