import {Router} from "express";
import users from "./users";
import companies from "./companies";
import projects from "./projects";
import models from "./models";
import bcf from "./bcf";

const route = Router();
route.use("/users", users);
route.use("/companies", companies);
route.use("/projects", projects);
route.use("/models", models);
route.use("/bcf", bcf);
export default route;
