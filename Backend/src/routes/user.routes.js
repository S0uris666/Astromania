import {Router} from "express";
import { createUser, loginUser, logoutUser,updateUser, verifyUser } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const userRouter = Router();


userRouter.post("/register", createUser); //http://localhost:3000/api/register
userRouter.post("/login", loginUser); //http://localhost:3000/api/login
userRouter.post("/logout", logoutUser); //http://localhost:3000/api/logout
userRouter.put('/update',auth, updateUser)//http://localhost:3000/api/update
userRouter.get('/verify-user',auth, verifyUser)//http://localhost:3000/api/verify-user


export default userRouter;