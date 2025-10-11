import {Router} from "express";
import { createUser, loginUser, logoutUser,updateUser, verifyUser } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import {validateSchema} from '../middlewares/validator.js'
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { adminGetAllUsers } from "../controllers/user.controller.js";
import { authRol } from "../middlewares/authRol.js";
import {adminPromoteUserToSuperuser} from '../controllers/user.controller.js'

const userRouter = Router();


userRouter.post("/register",validateSchema(registerSchema), createUser); //http://localhost:3000/api/register
userRouter.post("/login",validateSchema(loginSchema), loginUser); //http://localhost:3000/api/login
userRouter.post("/logout", logoutUser); //http://localhost:3000/api/logout
userRouter.put('/update',auth, updateUser)//http://localhost:3000/api/update
userRouter.get('/verify-user',auth, verifyUser)//http://localhost:3000/api/verify-user




userRouter.get("/admin/users", auth, authRol("admin"), adminGetAllUsers); //http://localhost:3000/api/admin/users
userRouter.post("/admin/user/promote/:id", auth, authRol("admin"), adminPromoteUserToSuperuser); //http://localhost:3000/api/admin/user/promote/:id

export default userRouter;