import { useState } from "react";
import { sendMessage } from "../../api/contactService";

export function Contacto() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Iniciamos carga
    setStatus(""); // Limpiamos mensaje

    try {
      const response = await sendMessage(formData);
      console.log("Respuesta del servidor:", response);
      if (!response || !response.success) {
        setStatus(response?.error || "Hubo un error al enviar el correo.");
        return;
      }

      setStatus("¡Correo enviado correctamente!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error enviando el correo:", error);
      setStatus("Hubo un error al enviar el correo.");
    } finally {
      setLoading(false); // Terminamos carga
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
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

          <button
            type="submit"
            className="btn btn-secondary w-full"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>

          {status && <p className="text-center text-success mt-2">{status}</p>}
        </form>
      </div>
    </div>
  );
}
