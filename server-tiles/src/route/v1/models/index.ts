import {Router} from "express";

import {modelController} from "../../../controller";

const route = Router();
route.get("", modelController.read);
route.get("/:id", modelController.findById);
route.post("", modelController.create);
route.put("/:id", modelController.update);
route.delete("/:id", modelController.delete);
export default route;
