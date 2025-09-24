import { createPaymentPreference } from "../services/payment.service.js";

export const createPreference = async (req, res) => {
  try {
    const preferenceData = req.body;  //dentro esta items son las preferencias del pago (caracteristicas del producto)
    const preference = await createPaymentPreference(preferenceData);
    
    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ruta de prueba para crear una preferencia de pago

export const testPreference = async (req, res) => {
  const preferenceData = {
    items: [
      { title: "Producto test", quantity: 1, unit_price: 100 },
      { title: "Producto extra", quantity: 2, unit_price: 50 },
    ],
    back_urls: {
      success:"https://hyperangelic-ira-unturgid.ngrok-free.dev/api/payments/success",
      failure:"https://hyperangelic-ira-unturgid.ngrok-free.dev/api/payments/failure",
      pending:"https://hyperangelic-ira-unturgid.ngrok-free.dev/api/payments/pending",
    } ,
     auto_return: "approved",  //vuelve a la pagina de success, failure o pending segun el caso
     notification_url: "https://hyperangelic-ira-unturgid.ngrok-free.dev/api/payments/notification",  //se hace el pago y me avisa a esta url

  };

  try {
    const preference = await createPaymentPreference(preferenceData);

    console.log("ID de preferencia:", preference.id);
    console.log("Checkout URL:", preference.init_point);
    console.log("success URL:", preference.back_urls.success);

    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
