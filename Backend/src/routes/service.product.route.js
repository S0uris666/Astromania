import {Router} from "express";
import { createServiceProduct, getAllServiceProducts/* , getServiceProductById, updateServiceProduct, deleteServiceProduct */ } from "../controllers/serviceProduct.controller.js";
import auth from "../middlewares/auth.js";
import { authRol } from "../middlewares/authRol.js";
import multer from "multer";
const serviceProductRouter = Router();
const upload = multer({storage: multer.memoryStorage()}); 

serviceProductRouter.post("/user/service-product/create", auth, authRol("admin"),upload.array("images",6), createServiceProduct);
serviceProductRouter.get("/service-products/readall", getAllServiceProducts);
/* serviceProductRouter.get("/service-product/read/:id", getServiceProductById);
serviceProductRouter.put("/user/service-product/update/:id", auth, authRol("admin"), updateServiceProduct);
serviceProductRouter.delete("/user/service-product/delete/:id", auth, authRol("admin"), deleteServiceProduct); */

export default serviceProductRouter