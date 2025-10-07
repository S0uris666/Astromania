import axios from "axios";
import client from "./client.js";

const API = import.meta.env.VITE_BACKEND_URL;

// Crear preferencia de pago
export const createPaymentPreference = async (items, backUrls = {}) => {
  try {
    const preferenceData = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity || 1,
        unit_price: item.price,
        currency_id: "CLP",
        description: item.description || item.title
      })),
      back_urls: {
        success: backUrls.success || `${window.location.origin}/payment/success`,
        failure: backUrls.failure || `${window.location.origin}/payment/failure`,
        pending: backUrls.pending || `${window.location.origin}/payment/pending`,
      },
      auto_return: "approved",
      notification_url: `${API}/payments/notification`,
      payer: {
        name: backUrls.payerName || "",
        email: backUrls.payerEmail || ""
      }
    };

    const {data} = await client.post(`/payments/create_preference`, preferenceData);
    return data;
  } catch (error) {
    console.error("Error creating payment preference:", error);
    throw error;
  }
};

// Obtener estado del pago
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`${API}/payments/status/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw error;
  }
};