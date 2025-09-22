import dotenv from "dotenv";
dotenv.config();
// SDK de Mercado Pago
import { MercadoPagoConfig } from 'mercadopago';
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: process.env.TEST_ACCESS_TOKEN });

export default client;