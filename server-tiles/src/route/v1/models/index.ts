import {Router} from "express";

import {modelController} from "../../../controller";
import {clerkMiddleware} from "../../../db";

const route = Router();
route.post("/uploads", clerkMiddleware(), modelController.uploadFiles);
export default route;
