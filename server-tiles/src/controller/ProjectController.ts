import {Request, Response, NextFunction} from "express";
import {projectMembers, projects, users} from "../db/schema";
import {BaseController} from "./BaseController";
import {db} from "../db";
import {forbidden} from "../config/ErrorHandler";
import {eq, inArray, sql} from "drizzle-orm";

export class ProjectController extends BaseController<
  typeof projects.$inferInsert
> {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {projectName, address} = req.body;
      if (!projectName || !address)
        return next(forbidden("Missing Project name or address"));
      const project = await this.db
        .insert(projects)
        .values({name: projectName, address})
        .returning({id: projects.id});

      await this.db.insert(projectMembers).values({
        projectId: project[0].id,
        memberId: req.user?.id,
        role: "manager",
      });
      res.status(200).json({
        projectId: project[0].id,
        memberId: req.user?.id,
        role: "manager",
      });
    } catch (error: any) {
      next(error);
    }
  };
  read = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memberId = req.user?.id;
      const data = await this.db
        .select({projectId: projectMembers.projectId})
        .from(projectMembers)
        .where(eq(projectMembers.memberId, memberId))
        .execute();

      const list = await this.db
        .select()
        .from(projectMembers)
        .where(
          inArray(
            projectMembers.projectId,
            data.map((d) => d.projectId)
          )
        )
        .execute();

      const groupedProjects = list.reduce((acc, item) => {
        if (!acc[item.projectId]) {
          acc[item.projectId] = {
            projectId: item.projectId,
            members: [],
          };
        }
        acc[item.projectId].members.push({
          memberId: item.memberId,
          role: item.role,
        });
        return acc;
      }, {} as {[key: string]: {projectId: string; members: Array<{memberId: string; role: string}>}});

      const result = Object.values(groupedProjects);

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id} = req.params;
      if (!id) return next(forbidden("Missing id in params"));
      const {address, name, members} = req.body;

      if (members && Array.isArray(members)) {
        const memberIds = members.map((member) => member.id);
        const validMembers = await this.db
          .select()
          .from(users)
          .where(inArray(users.id, memberIds));
        if (validMembers.length !== members.length) {
          return next(forbidden("Some members do not exist in users table"));
        }

        await this.db.insert(projectMembers).values(
          members.map((member) => ({
            projectId: id,
            memberId: member.id,
            role: member.role,
          }))
        );
      }
      await this.db
        .update(projects)
        .set({address: address || "", name: name || ""})
        .where(eq(projects.id, id));
      res.status(200).json({
        id,
      });
    } catch (error: any) {
      next(error);
    }
  };
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
