const API = import.meta.env.VITE_BACKEND_URL;
const CONTACT_ENDPOINT = API ? `${API}/contact` : "/api/contact";

export const sendMessage = async ({
  name,
  email,
  subject,
  message,
  recaptcha,
  captchaA,
  captchaB,
  captchaAnswer,
}) => {
  const controller = new AbortController();
  const timeoutMs = 25000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        recaptcha,
        captchaA,
        captchaB,
        captchaAnswer,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      let detail;
      let serverMessage = "";
      if (contentType.includes("application/json")) {
        detail = await res.json().catch(() => null);
        serverMessage =
          detail?.error ||
          detail?.message ||
          detail?.detail?.error ||
          "";
      } else {
        detail = await res.text().catch(() => "");
      }
      return {
        error: serverMessage || "No se pudo enviar el mensaje",
        status: res.status,
        detail,
      };
    }
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    return { error: "Respuesta no valida del servidor" };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      return { error: "Tiempo de espera agotado al enviar el mensaje" };
    }
    console.error("Error al enviar mensaje:", error);
    return { error: "No se pudo enviar el mensaje" };
  }
};
