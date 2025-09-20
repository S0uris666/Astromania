import express from "express";
const  contactRouter =express.Router();
import { createContact } from "../controllers/contact.controller.js";

/* Agregar algun tipo de seguridad para no permitir que cualquiera pueda enviar mensajes de spam */

contactRouter.post('/contact', createContact)


export default contactRouter;