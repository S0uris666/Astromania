import dotenv from "dotenv";
dotenv.config();

import { MercadoPagoConfig } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("MP_ACCESS_TOKEN is missing");
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 30000, locale: "es-CL" }
});

export default client;