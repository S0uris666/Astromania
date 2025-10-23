import nodemailer from "nodemailer";

const parseBoolean = (value, defaultValue = true) => {
  if (value == null) return defaultValue;
  return String(value).toLowerCase() !== "false";
};

export function createTransporter() {
  const {
    SMTP_USER,
    SMTP_PASS,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
  } = process.env;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "465", 10),
    secure: parseBoolean(SMTP_SECURE, true),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: parseBoolean(
        process.env.SMTP_REJECT_UNAUTHORIZED,
        false,
      ),
    },
  });
}

export async function sendContactMail({
  fromLabel = "Astromania WEB",
  subject,
  html,
  replyTo,
}) {
  const { EMAIL_USER, EMAIL_JP } = process.env;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `${fromLabel} <${EMAIL_USER}>`,
    to: EMAIL_JP,
    replyTo,
    subject,
    html,
  });
}
