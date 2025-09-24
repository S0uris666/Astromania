import express from "express";
import { createPreference } from "../controllers/payment.controller.js";
import { testPreference } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/create_preference", createPreference);//http://localhost:3000/api/payments/create_preference
 
paymentRouter.get("/test_preference", testPreference);//http://localhost:3000/api/payments/test_preference


paymentRouter.get("/success", (req, res) => { //http://localhost:3000/api/payments/success
  res.send("Ruta de pagos funcionando!");
});


paymentRouter.post("/notification", (req, res) => {
  console.log("Notificación recibida:", req.body);
  res.status(200).send("Notificación recibida");
}) //http://localhost:3000/api/payments/notification

export default paymentRouter