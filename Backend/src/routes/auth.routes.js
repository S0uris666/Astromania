import {Router} from "express";
import { register, login } from "../controllers/auth.controller.js";
const authRouter = Router();


authRouter.post("/register", register); //http://localhost:3000/api/register
authRouter.post("/login", login); //http://localhost:3000/api/login


export default authRouter;