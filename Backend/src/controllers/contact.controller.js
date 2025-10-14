
import nodemailer from "nodemailer";

// Helper: fetch con timeout (Node 18+ tiene fetch global)
async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}


export const createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message || !subject) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const { EMAIL_USER, EMAIL_PASS, EMAIL_JP, RESEND_API_KEY, RESEND_FROM } = process.env;

    // Intentar primero vía API (Resend) si está configurado
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Nuevo mensaje desde Astromania WEB</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      
      <p><strong>Mensaje:</strong></p>
      <p style=\"padding: 10px; background-color: #f4f4f4; border-radius: 5px;\">${message}</p>
      <hr>
      <p style=\"font-size: 0.9em; color: #555;\">Este mensaje fue enviado desde el formulario de contacto de Astromania WEB.</p>
    </div>`;

    if (RESEND_API_KEY && RESEND_FROM && EMAIL_JP) {
      try {
        const r = await fetchWithTimeout(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: [EMAIL_JP],
              subject,
              html,
              reply_to: email,
            }),
          },
          12000
        );
        if (r.ok) {
          return res.json({ success: true, message: "Correo enviado con éxito" });
        } else {
          const body = await r.text().catch(() => "");
          console.error("[Resend] Error:", r.status, body);
        }
      } catch (e) {
        console.error("[Resend] Exception:", e?.message || e);
      }
      // si Resend falla, seguimos con SMTP como fallback
    }

    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_JP) {
      return res.status(503).json({ error: "Servicio de correo no configurado" });
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      // pool para reutilizar conexión y bajar latencia
      pool: true,
      maxConnections: 1,
      maxMessages: 50,
      keepAlive: true,
      // timeouts más amplios para entornos PaaS
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    // Verificar conexión SMTP rápidamente (debug)
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("VERIFY_TIMEOUT")), 8000)),
      ]);
    } catch (verr) {
      console.error("[SMTP VERIFY]", verr?.code || verr?.message || verr);
      // seguimos para intentar enviar; verify puede fallar incluso si sendMail funciona
    }

    // Configuración del correo
const mailOptions = {
  from: `"${subject}" <${EMAIL_USER}>`,
  to: EMAIL_JP,
  replyTo: email,
  subject: subject,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Nuevo mensaje desde Astromania WEB</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      
      <p><strong>Mensaje:</strong></p>
      <p style="padding: 10px; background-color: #f4f4f4; border-radius: 5px;">${message}</p>
      <hr>
      <p style="font-size: 0.9em; color: #555;">Este mensaje fue enviado desde el formulario de contacto de Astromania WEB.</p>
    </div>
  `,
};

    // Enviar correo con timeout de operación
    const sendWithTimeout = (options, timeoutMs = 20000) =>
      new Promise((resolve, reject) => {
        const to = setTimeout(() => reject(new Error("MAIL_TIMEOUT")), timeoutMs);
        transporter
          .sendMail(options)
          .then((r) => {
            clearTimeout(to);
            resolve(r);
          })
          .catch((err) => {
            clearTimeout(to);
            reject(err);
          });
      });

    await sendWithTimeout(mailOptions);

    return res.json({ success: true, message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("Error enviando correo:", {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response,
    });
    return res.status(502).json({ error: "Hubo un problema al enviar el correo" });
  }
};
