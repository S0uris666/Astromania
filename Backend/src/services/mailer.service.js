import nodemailer from "nodemailer";

export function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendContactMail({ fromLabel = "Astromanía WEB", subject, html, replyTo }) {
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

