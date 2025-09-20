
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
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_JP, // tu correo (donde recibes los mensajes)
      subject: subject,
      text: `
        Nombre: ${name}
        Email: ${email}
        Asunto: ${subject}
        Mensaje: ${message}
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