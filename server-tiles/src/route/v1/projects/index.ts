import {Router} from "express";
import {projectController, userController} from "../../../controller";

const route = Router();
route.use(userController.authorization);
route.get("", projectController.read);
route.get("/:id", projectController.findById);
route.post("", userController.authPermissionProject, projectController.create);
route.put(
  "/:id",
  userController.authPermissionProject,
  projectController.update
);
route.delete(
  "/:id",
  userController.authPermissionProject,
  projectController.delete
);
export default route;
