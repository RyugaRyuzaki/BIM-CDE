import {Router} from "express";

import {modelController} from "../../../controller";
import {clerkMiddleware} from "../../../db";

const route = Router();
route.post("/uploads", clerkMiddleware(), modelController.uploadFiles);
route.post("/properties", modelController.properties);
route.get("/:modelId/properties/:name", modelController.getProperties);
export default route;
