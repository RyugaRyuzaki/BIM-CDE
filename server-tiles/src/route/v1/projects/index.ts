import {Router} from "express";

import {projectController} from "../../../controller";

const route = Router();
route.get("", projectController.read);
route.get("/:id", projectController.findById);
route.post("", projectController.create);
route.put("/:id", projectController.update);
route.delete("/:id", projectController.delete);
export default route;
