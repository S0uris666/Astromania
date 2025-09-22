import { createPaymentPreference } from "../services/payment.service.js";

export const createPreference = async (req, res) => {
  try {
    const { items } = req.body;
    const preference = await createPaymentPreference(items);

    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};