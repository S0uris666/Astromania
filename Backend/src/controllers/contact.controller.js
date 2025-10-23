import { verifyRecaptcha } from "../services/captcha.service.js";
import { sendContactMail } from "../services/mailer.service.js";

const isFallbackCaptchaValid = (a, b, ans) => {
  const n1 = Number(a);
  const n2 = Number(b);
  const n3 = Number(ans);
  return (
    Number.isFinite(n1) &&
    Number.isFinite(n2) &&
    Number.isFinite(n3) &&
    n3 === n1 + n2
  );
};

export const createContact = async (req, res) => {
  const {
    name,
    email,
    subject,
    message,
    recaptcha,
    captchaA,
    captchaB,
    captchaAnswer,
  } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const { SMTP_USER, SMTP_PASS, SMTP_JP } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !SMTP_JP) {
    return res
      .status(503)
      .json({ error: "Servicio de correo no configurado" });
  }

  try {
    const token = typeof recaptcha === "string" ? recaptcha.trim() : "";
    const secret = process.env.RECAPTCHA_SECRET;

    if (token && secret) {
      const vr = await verifyRecaptcha(token, req.ip);
      if (!vr.ok) {
        const detail = {
          reason: vr.reason,
          error: vr.error,
          codes: vr.data?.["error-codes"],
        };
        console.warn("Recaptcha verification failed:", detail);

        if (!isFallbackCaptchaValid(captchaA, captchaB, captchaAnswer)) {
          return res
            .status(400)
            .json({ error: "Captcha invalido", detail });
        }
        console.warn(
          "Fallback captcha validated after Recaptcha failure. Proceeding.",
          { detail },
        );
      }
    } else if (secret && !token) {
      return res.status(400).json({ error: "Captcha requerido" });
    } else {
      if (!isFallbackCaptchaValid(captchaA, captchaB, captchaAnswer)) {
        return res.status(400).json({ error: "Captcha invalido" });
      }
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
        <h2>Nuevo mensaje desde Astromania WEB</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p style="padding:10px;background:#f4f4f4;border-radius:5px;">${message}</p>
        <hr/>
        <p style="font-size:0.9em;color:#555;">Formulario de contacto.</p>
      </div>
    `;

    await sendContactMail({
      replyTo: email,
      subject,
      html,
      fromLabel: "Astromania WEB",
    });
    return res.json({ success: true, message: "Correo enviado con exito" });
  } catch (err) {
    console.error("MAIL ERROR:", err?.code, err?.message || err);
    return res
      .status(502)
      .json({ error: "Hubo un problema al enviar el correo" });
  }
};
