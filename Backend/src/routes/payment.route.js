import express from "express";
import { createPreference } from "../controllers/payment.controller.js";
import { createPaymentPreference } from "../services/payment.service.js";

const paymentRouter = express.Router();

paymentRouter.post("/create_preference", createPreference);
 
paymentRouter.get("/test_preference", async (req, res) => {


  const items = [
    { title: "Producto test", quantity: 1, unit_price: 2000 }
  ];
  try {
    const preference = await createPaymentPreference(items);
    
    console.log("ID de preferencia (test GET):", preference.id);
    console.log("URL de checkout:", preference.init_point);
    console.log("Token usado:", process.env.TEST_ACCESS_TOKEN);

    
    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default paymentRouter