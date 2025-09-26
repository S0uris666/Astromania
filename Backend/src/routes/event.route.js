import {Router} from 'express';
import { createEvent, updateEvent, deleteEvent, getEventById, getAllEvents,getAllPublicEvents,getPublicEventById }from '../controllers/event.controller.js';
import auth from '../middleware/auth.middleware.js';
import authRol from '../middleware/authRole.middleware.js';
const routerEvent = Router();

//  Rutas públicas (sin auth, cualquiera puede usarlas)
routerEvent.get("/readall", getAllPublicEvents);         // Listar todos los eventos
routerEvent.get("/read/:id", getPublicEventById);   // Ver detalle de un evento

//  Rutas privadas (requieren auth y rol)
routerEvent.get("/readallprivate", auth, authRol("superuser", "admin"), getAllEvents); // Listar todos los eventos (privado)
routerEvent.post("/create", auth, authRol("superuser", "admin"), createEvent);
routerEvent.put("/update/:id", auth, authRol("superuser", "admin"), updateEvent);
routerEvent.delete("/delete/:id", auth, authRol("superuser", "admin"), deleteEvent);
routerEvent.get("/readprivate/:id", auth, authRol("superuser", "admin"), getEventById); // Ver detalle de un evento (privado)

export default routerEvent;