const API = import.meta.env.VITE_BACKEND_URL;

export const sendMessage = async ({ name, email, subject, message }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${API}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { error: "No se pudo enviar el mensaje", status: res.status, detail };
    }
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: "Respuesta no válida del servidor" };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error al enviar mensaje:", error);
    return { error: "No se pudo enviar el mensaje" };
  }
};
