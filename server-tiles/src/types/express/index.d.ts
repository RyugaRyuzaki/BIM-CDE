import {JwtPayload} from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: {id: string; role: "manager" | "member" | "owner"} | JwtPayload;
    projectId?: string | JwtPayload;
  }
}
