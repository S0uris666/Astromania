import express from "express";
import { createPreference, testPreference, getStatus,successReturn,failureReturn,
  pendingReturn, webhook
 } from "../controllers/payment.controller.js";


const paymentRouter = express.Router();

paymentRouter.post("/create_preference", createPreference);//http://localhost:3000/api/payments/create_preference
 
paymentRouter.get("/test_preference", testPreference);//http://localhost:3000/api/payments/test_preference


paymentRouter.get("/status/:paymentId", getStatus); //http://localhost:3000/api/payments/status/:paymentId
paymentRouter.get("/success", successReturn);
paymentRouter.get("/failure", failureReturn);
paymentRouter.get("/pending", pendingReturn);


/* paymentRouter.post("/notification", (req, res) => {
  console.log("Notificación recibida:", req.body);
  res.status(200).send("Notificación recibida");
}) //http://localhost:3000/api/payments/notification */


paymentRouter.post("/notification", webhook); 

export default paymentRouter