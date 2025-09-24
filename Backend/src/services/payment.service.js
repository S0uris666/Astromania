import { Preference } from "mercadopago";
import client from "../config/mercadoPago.js";

const preference = new Preference(client);

export const createPaymentPreference = async (preferenceData) => {
  console.log("Token en service:", process.env.TEST_ACCESS_TOKEN);
  try {
    console.log("Response from MercadoPago:", preferenceData);
    const response = await preference.create({
      body: preferenceData,
    });

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};
