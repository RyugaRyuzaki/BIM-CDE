import {Router} from "express";
import v1 from "./v1";
import v2 from "./v2";
const route = Router();
route.use("/v1", v1);
route.use("/v2", v2);
export default route;
