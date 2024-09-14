import express, {Router} from "express";
import bodyParser from "body-parser";
import users from "./users";
import projects from "./projects";
import models from "./models";
import bcf from "./bcf";
import {clerkMiddleware} from "../../db";

const route = Router();
route.use("/users", users);
route.use(bodyParser.json({limit: "1024mb"}));
route.use(express.json());
route.use("/projects", clerkMiddleware(), projects);
route.use("/models", models);
route.use("/bcf", bcf);
export default route;
