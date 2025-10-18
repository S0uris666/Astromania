import express from "express";
import {
  createPreference,
  failureReturn,
  getStatus,
  pendingReturn,
  successReturn,
  webhook,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

// http://localhost:3000/api/payments/create_preference
paymentRouter.post("/create_preference", createPreference);

// http://localhost:3000/api/payments/status/:paymentId
paymentRouter.get("/status/:paymentId", getStatus);

paymentRouter.get("/success", successReturn);
paymentRouter.get("/failure", failureReturn);
paymentRouter.get("/pending", pendingReturn);

// http://localhost:3000/api/payments/notification
paymentRouter.post("/notification", webhook);

export default paymentRouter;

