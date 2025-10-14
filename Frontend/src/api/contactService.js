const API = import.meta.env.VITE_BACKEND_URL;


export const sendMessage = async ({ name, email, subject, message }) => {
  try {
    const res = await fetch(`${API}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    return await res.json();
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return { error: "No se pudo enviar el mensaje" };
  }
};
