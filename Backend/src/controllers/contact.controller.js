
import nodemailer from "nodemailer";


export const createContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message || !subject) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Configurar el transporte de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // o usa host: "smtp.gmail.com"
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configuración del correo
const mailOptions = {
  from: `"${subject}" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_JP,
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

    // Enviar correo
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ error: "Hubo un problema al enviar el correo" });
  }
};