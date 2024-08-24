import {Router} from "express";
import {userController} from "../../../controller";

const route = Router();
route.get("", userController.read);
route.post("", userController.create);
route.use(userController.authorization);
route.put("", userController.update);
route.delete("", userController.delete);
export default route;
