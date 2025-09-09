import { useState } from "react";
import emailjs from "@emailjs/browser";

export function Contacto() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Enviando...");
    const SERVICE_ID = "service_gfpmasb";
    const TEMPLATE_ID = "template_snfggxe";
    const PUBLIC_KEY = "ctEUdwn4a4dbyHxKB";

    emailjs.send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY).then(
      (response) => {
        console.log("Correo enviado:", response);
        setStatus("¡Correo enviado correctamente!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      },
      (error) => {
        console.error("Error al enviar correo:", error);
        setStatus("Error al enviar el correo. Intenta nuevamente.");
      }
    );

    setTimeout(() => {
      setStatus("¡Correo enviado correctamente!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Contáctanos
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral shadow-xl rounded-lg p-6 space-y-4"
        >
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered input-neutral w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Correo electrónico</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="input input-neutral w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Asunto</span>
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Asunto"
              value={formData.subject}
              onChange={handleChange}
              className="input input-neutral w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Mensaje</span>
            </label>
            <textarea
              name="message"
              placeholder="Escribe tu mensaje..."
              value={formData.message}
              onChange={handleChange}
              className="textarea  textarea-neutral w-full"
              rows={5}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary w-full">
            Enviar
          </button>

          {status && <p className="text-center text-success mt-2">{status}</p>}
        </form>
      </div>
    </div>
  );
}
