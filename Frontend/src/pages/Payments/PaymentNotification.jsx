import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const WEBHOOK_URL = import.meta.env.VITE_MP_WEBHOOK_URL;
const VISUAL_NOTIFICATION_URL = import.meta.env.VITE_MP_NOTIFICATION_PANEL_URL;
const STORAGE_KEY = "mp-notification-history";

const DEFAULT_PAYLOAD = {
  type: "payment",
  action: "payment.updated",
  data: {
    id: "TEST_PAYMENT_ID",
  },
};

const createId = () =>
  typeof crypto !== "undefined" && crypto?.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const PaymentNotification = () => {
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(DEFAULT_PAYLOAD, null, 2)
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("No se pudo leer el historial de notificaciones:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const parsedPayload = useMemo(() => {
    try {
      return JSON.parse(payloadText);
    } catch {
      return null;
    }
  }, [payloadText]);

  const handleSendTest = async () => {
    if (!parsedPayload) {
      setResult({
        ok: false,
        message: "El JSON no es válido. Corrige el formato antes de enviar.",
      });
      return;
    }

    if (!WEBHOOK_URL) {
      setResult({
        ok: false,
        message:
          "No hay una URL de webhook configurada. Define VITE_MP_WEBHOOK_URL en el entorno.",
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedPayload),
      });

      const text = await response.text();
      const entry = {
        id: createId(),
        timestamp: new Date().toISOString(),
        payload: parsedPayload,
        status: response.status,
        response: text,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
      setResult({
        ok: response.ok,
        message: response.ok
          ? "Notificación enviada correctamente."
          : `Respuesta inesperada (${response.status}).`,
        response: text,
      });
    } catch (error) {
      setResult({
        ok: false,
        message: "No se pudo enviar la notificación.",
        response: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold">
            Centro de notificaciones de Mercado Pago
          </h1>
          <p className="text-base-content/70 max-w-3xl mx-auto">
            Usa esta consola para verificar el webhook configurado, enviar
            notificaciones de prueba y revisar el historial reciente de eventos
            recibidos. Esta vista no reemplaza los registros del backend, pero
            ayuda a monitorear rápidamente que todo esté conectado.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="card bg-base-100 shadow-lg">
            <div className="card-body space-y-4">
              <div>
                <h2 className="card-title">Webhook en producción</h2>
                <p className="text-sm text-base-content/70">
                  Esta es la URL registrada en Mercado Pago para recibir los
                  eventos oficiales de pago:
                </p>
                {WEBHOOK_URL ? (
                  <a
                    href={WEBHOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary break-all text-sm"
                  >
                    {WEBHOOK_URL}
                  </a>
                ) : (
                  <span className="text-error text-sm">
                    URL no configurada (revisa VITE_MP_WEBHOOK_URL)
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-sm">Vista pública</h3>
                <p className="text-sm text-base-content/70">
                  Para compartir con el equipo o validar rápidamente la página
                  de confirmación visual:
                </p>
                {VISUAL_NOTIFICATION_URL ? (
                  <a
                    href={VISUAL_NOTIFICATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-secondary break-all text-sm"
                  >
                    {VISUAL_NOTIFICATION_URL}
                  </a>
                ) : (
                  <span className="text-error text-sm">
                    URL no configurada (revisa VITE_MP_NOTIFICATION_PANEL_URL)
                  </span>
                )}
              </div>


            </div>
          </article>

          <article className="card bg-base-100 shadow-lg">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Enviar notificación de prueba</h2>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() =>
                    setPayloadText(JSON.stringify(DEFAULT_PAYLOAD, null, 2))
                  }
                >
                  Restablecer JSON
                </button>
              </div>

              <p className="text-sm text-base-content/70">
                Mercado Pago enviará una carga similar a esta. Puedes adaptar el
                ID de pago o los campos que quieras validar.
              </p>

              <textarea
                className="textarea textarea-bordered w-full h-56 font-mono text-xs"
                value={payloadText}
                onChange={(event) => setPayloadText(event.target.value)}
                spellCheck={false}
                aria-label="Payload JSON"
              />

              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleSendTest}
                disabled={sending}
              >
                {sending ? "Enviando..." : "Enviar a webhook"}
              </button>

              {result && (
                <div
                  className={`alert ${result.ok ? "alert-success" : "alert-error"} text-sm`}
                >
                  <span>{result.message}</span>
                  {result.response && (
                    <pre className="mt-2 whitespace-pre-wrap break-all text-xs">
                      {result.response}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="card bg-base-100 shadow-lg">
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Historial reciente</h2>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClearHistory}
                disabled={history.length === 0}
              >
                Limpiar historial
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-base-content/60">
                Aún no registramos notificaciones. Envía una prueba o espera a
                que Mercado Pago informe un evento real.
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-auto pr-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-base-200 p-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-base-content">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="badge badge-outline">
                        HTTP {entry.status}
                      </span>
                    </div>
                    <details className="bg-base-200/70 rounded-md p-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Payload enviado
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap break-all">
                        {JSON.stringify(entry.payload, null, 2)}
                      </pre>
                    </details>
                    {entry.response && (
                      <details className="bg-base-200/60 rounded-md p-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Respuesta del servidor
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap break-all">
                          {entry.response}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="text-center space-y-2">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="btn btn-ghost">
              Volver al inicio
            </Link>
            <Link to="/admin" className="btn btn-secondary">
              Ir al panel administrativo
            </Link>
            <Link to="/servicios-productos-list" className="btn btn-outline">
              Ver catálogo
            </Link>
          </div>
          <p className="text-xs text-base-content/60">
            Recuerda contrastar estos registros con los logs del backend para
            auditorías completas.
          </p>
        </footer>
      </div>
    </div>
  );
};
