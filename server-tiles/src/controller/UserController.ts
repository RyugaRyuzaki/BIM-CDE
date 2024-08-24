import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {users} from "../db/schema";
import {BaseController} from "./BaseController";
import {db} from "../db";
import env from "../config/env";
import {forbidden, conflict, notFound} from "../config/ErrorHandler";
import {eq, or} from "drizzle-orm";
export class UserController extends BaseController<typeof users.$inferInsert> {
  private readonly forbidden = "Missing username, email or password" as const;
  private readonly conflict = "username or email is exists" as const;

  private getUser = (user: Partial<typeof users.$inferInsert>) => {
    const {id, role, username, email, phone, avatar} = user;
    return {id, role, username, email, phone, avatar};
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {scope} = req.query;
      if (!scope || typeof scope !== "string")
        next(forbidden(`Missing scope in query params`));
      if (scope === "signUp") {
        await this.signUp(req, res, next);
      } else {
        await this.signIn(req, res, next);
      }
    } catch (error: any) {
      next(error);
    }
  };
  private signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {username, email, password, role} = req.body;
      if (!username || !email || !password)
        return next(forbidden(this.forbidden));
      const existingUser = await this.db
        .select()
        .from(users)
        .where(or(eq(users.username, username), eq(users.email, email)))
        .execute();

      if (existingUser.length > 0) return next(conflict(this.conflict));
      const salt = await bcrypt.genSalt(8);
      const hashed = await bcrypt.hash(password, salt);
      await this.db
        .insert(users)
        .values({username, email, password: hashed, role: role || "member"});
      res.status(200).json({username, email});
    } catch (error: any) {
      next(error);
    }
  };
  private signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {usernameOrEmail, password} = req.body;
      if (!usernameOrEmail || !password) next(forbidden(this.forbidden));
      const user = await this.db.query.users.findFirst({
        where: or(
          eq(users.username, usernameOrEmail),
          eq(users.email, usernameOrEmail)
        ),
      });
      if (!user) return next(notFound(`usernameOrEmail wrong`));
      const encodePassword = await bcrypt.compare(password, user.password);
      if (!encodePassword) return next(notFound("password wrong"));
      const accessToken = this.setAccessToken(user);
      this.setCookie(res, user!);
      const getUser = this.getUser(user);
      res.status(200).json({...getUser, accessToken});
    } catch (error: any) {
      next(error);
    }
  };
  read = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.db.select().from(users);
      res
        .status(200)
        .json(
          data.map(({id, username, password}) => ({id, username, password}))
        );
    } catch (error: any) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user} = req;
      const {phone, avatar} = req.body;
      await this.db
        .update(users)
        .set({phone: phone || null, avatar: avatar || null})
        .where(eq(users.id, user?.id));
      res.status(200).json(user);
    } catch (error: any) {
      next(error);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user} = req;
      await this.db
        .delete(users)
        .where(eq(users.id, user?.id))
        .returning({id: users.id, role: users.role});
      const data = await this.db.select().from(users);
      res.status(200).json(data.map(({id, username}) => ({id, username})));
    } catch (error: any) {
      next(error);
    }
  };
  bulkInsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.db.select().from(users);
      res.status(200).json(data);
    } catch (error: any) {
      next(error);
    }
  };
  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.db.select().from(users);
      res.status(200).json(data);
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
      const data = await this.db.select().from(users);
      res.status(200).json(data);
    } catch (error: any) {
      next(error);
    }
  };
  authorization = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || typeof auth !== "string")
      return res.status(401).json({message: `UnAuthorized`});
    const accessToken = auth.replace("Bearer ", "");
    if (!accessToken) {
      return res.status(401).json({message: `UnAuthorized`});
    }

    jwt.verify(accessToken, env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        return res.status(401).json({message: `Token is expired`});
      } else {
        req.user = user as {id: string; role: "manager" | "member" | "owner"};
        next();
      }
    });
  };
  authPermissionProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({message: `UnAuthorized`});
    }
    const {role} = req.user;
    if (role !== "manager") {
      return res.status(403).json({message: `not permission `});
    }
    next();
  };
  authPermissionModel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({message: `UnAuthorized`});
    }
    const {role} = req.user;
    if (role === "owner") {
      return res.status(403).json({message: `not permission `});
    }
    next();
  };

  setCookie(res: Response, data: Partial<typeof users.$inferInsert>) {
    const refreshToken = this.setRefreshToken(data);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
  }
  setAccessToken = (data: Partial<typeof users.$inferInsert>) => {
    const {id, role} = data;
    return jwt.sign({id, role}, env.ACCESS_TOKEN, {
      expiresIn: env.EXP_ACCESS_TOKEN,
    });
  };
  setRefreshToken = (data: Partial<typeof users.$inferInsert>) => {
    const {id, role} = data;
    return jwt.sign({id, role}, env.REFRESH_TOKEN, {
      expiresIn: env.EXP_REFRESH_TOKEN,
    });
  };
}
export const userController = new UserController(db);
