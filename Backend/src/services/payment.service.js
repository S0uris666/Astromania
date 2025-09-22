import { Preference } from "mercadopago";
import client from "../config/mercadoPago.js";

const preference = new Preference(client);

export const createPaymentPreference = async (items) => {
    console.log("Token en service:", process.env.TEST_ACCESS_TOKEN);
  try {
    const response = await preference.create({ body: { items }, sandbox:true });
    return response;
    
  } catch (error) {
    throw new Error(error.message);
  }
};