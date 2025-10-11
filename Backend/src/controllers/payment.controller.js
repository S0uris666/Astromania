// /controllers/payment.controller.js
import { createPaymentPreference, getPaymentById } from "../services/payment.service.js";

// Crea preferencia
export const createPreference = async (req, res) => {
  try {
    const body = req.body;

    // Asegura contexto para conciliación
    const preference = await createPaymentPreference({
      ...body,
      external_reference: body.external_reference ?? `${body?.metadata?.eventId || "event"}-${body?.metadata?.userId || "user"}-${Date.now()}`
    });

    res.json(preference); // { id, init_point }
  } catch (error) {
    res.status(500).json({ error: error.message ,
      cause: error?.cause
    });
  }
};

// Estado de pago por ID
export const getStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const data = await getPaymentById(paymentId);
    res.json({
      id: data.id,
      status: data.status,             // approved | rejected | pending | in_process...
      status_detail: data.status_detail,
      transaction_amount: data.transaction_amount,
      currency_id: data.currency_id,
      payer: data.payer,
      order: data.order,
      external_reference: data.external_reference,
      metadata: data.metadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Éxito / fracaso (opcional: mostrar info al usuario)
export const successReturn = (req, res) => {
  // MP anexará query params: payment_id, status, merchant_order_id, preference_id
  res.send("Pago aprobado. Puedes cerrar esta ventana.");
};

export const failureReturn = (req, res) => {
  res.send("Pago rechazado o fallido.");
};

export const pendingReturn = (req, res) => {
  res.send("Pago pendiente.");
};

// Webhook: validar y actualizar tu BD
export const webhook = async (req, res) => {
  try {
    // MP puede enviar varias clases de notificación. En Checkout Pro, la más común es topic=payment
    const { type, action, data, id, topic } = req.body;

    // Soporte para ambos formatos:
    const paymentId =
      (data && (data.id || data.paymentId)) ||
      req.query["data.id"] ||
      req.query.id ||
      id;

    if (!paymentId) {
      // Importante responder 200 igualmente para que MP no reintente eternamente
      return res.status(200).send("OK (sin paymentId)");
    }

    // Obtén el pago para verificar monto, estado, etc.
    const payment = await getPaymentById(paymentId);

    return res.status(200).send("OK");
  } catch (err) {
    // Igualmente responde 200 para evitar tormenta de reintentos, pero loguea el error
    console.error("Webhook error:", err);
    return res.status(200).send("OK");
  }
};
