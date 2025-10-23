import express from "express";
const  contactRouter = express.Router();
import { createContact } from "../controllers/contact.controller.js";



contactRouter.post('/contact', createContact)


export default contactRouter;