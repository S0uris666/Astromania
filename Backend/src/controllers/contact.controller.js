import { verifyRecaptcha } from "../services/captcha.service.js";
import { sendContactMail } from "../services/mailer.service.js";

export const createContact = async (req, res) => {
  const { name, email, subject, message, recaptcha, captchaA, captchaB, captchaAnswer } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const { EMAIL_USER, EMAIL_PASS, EMAIL_JP } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_JP) {
    return res.status(503).json({ error: "Servicio de correo no configurado" });
  }

  try {
    if (process.env.RECAPTCHA_SECRET) {
      if (!recaptcha) return res.status(400).json({ error: "Captcha requerido" });
      const vr = await verifyRecaptcha(recaptcha, req.ip);
      if (!vr.ok) return res.status(400).json({ error: "Captcha inválido" });
    } else {
      const a = Number(captchaA), b = Number(captchaB), ans = Number(captchaAnswer);
      if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(ans) || ans !== a + b) {
        return res.status(400).json({ error: "Captcha inválido" });
      }
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>Nuevo mensaje desde Astromanía WEB</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="padding:10px;background:#f4f4f4;border-radius:5px;">${message}</p>
        <hr/>
        <p style="font-size:0.9em;color:#555;">Formulario de contacto.</p>
      </div>
    `;

    await sendContactMail({ replyTo: email, subject, html });
    return res.json({ success: true, message: "Correo enviado con éxito" });
  } catch (err) {
    console.error("MAIL ERROR:", err?.code, err?.message || err);
    return res.status(502).json({ error: "Hubo un problema al enviar el correo" });
  }
};

