import express, {Router} from "express";
import bodyParser from "body-parser";
import users from "./users";
import projects from "./projects";
import models from "./models";
import bcf from "./bcf";
import {clerkMiddleware} from "../../db";

const route = Router();
route.use("/users", users);
route.use(bodyParser.json({limit: "50mb"}));
route.use(express.json());
route.use(clerkMiddleware());
route.use("/projects", projects);
route.use("/models", models);
route.use("/bcf", bcf);
export default route;
