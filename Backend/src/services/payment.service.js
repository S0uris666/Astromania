// services/payment.service.js
import { Preference, Payment } from "mercadopago";
import client from "../config/mercadoPago.js";

export const createPaymentPreference = async (preferenceData) => {
  const preference = new Preference(client);
  try {
    // Normaliza items (asegura números y CLP)
    const items = (preferenceData.items || []).map(it => ({
      title: String(it.title),
      description: it.description ?? String(it.title),
      quantity: Number.isInteger(it.quantity) ? it.quantity : Number(it.quantity || 1),
      unit_price: Number(it.unit_price ?? it.price),
      currency_id: it.currency_id || "CLP",
    }));

    const body = {
      ...preferenceData,
      items,
        back_urls: {
    success: process.env.MP_SUCCESS_URL,  // 👈 HTTPS público
    failure: process.env.MP_FAILURE_URL,
    pending: process.env.MP_PENDING_URL,
  },
      notification_url: process.env.MP_WEBHOOK_URL ,
      auto_return: preferenceData.auto_return || "approved",
    };

    // token para verificar que existe


    const response = await preference.create({ body });
    return { id: response.id, init_point: response.init_point };
  } catch (error) {
    console.error("MP createPreference ERROR.message:", error?.message);
    console.error("MP createPreference ERROR.cause:", error?.cause); 
    throw error; 
  }
};

export const getPaymentById = async (paymentId) => {
  const payment = new Payment(client);
  return await payment.get({ id: paymentId });
};
