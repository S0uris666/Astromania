import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../../api/contactService";

export function Contacto() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const [recaptchaToken, setRecaptchaToken] = useState("");
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Fallback captcha (si no hay reCAPTCHA key)
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    if (!siteKey) {
      const a = Math.floor(Math.random() * 8) + 1;
      const b = Math.floor(Math.random() * 8) + 1;
      setCaptchaA(a);
      setCaptchaB(b);
      return;
    }
    const src = "https://www.google.com/recaptcha/api.js?render=explicit";
    const ensureScript = () => new Promise((resolve) => {
      if (window.grecaptcha) return resolve();
      const s = document.createElement("script");
      s.src = src; s.async = true; s.defer = true; s.onload = () => resolve();
      document.head.appendChild(s);
    });
    let cancelled = false;
    (async () => {
      await ensureScript();
      if (cancelled) return;
      window.grecaptcha.ready(() => {
        if (!recaptchaRef.current) return;
        const id = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          callback: (token) => setRecaptchaToken(token || ""),
          "expired-callback": () => setRecaptchaToken(""),
          "error-callback": () => setRecaptchaToken(""),
          theme: "light",
        });
        widgetIdRef.current = id;
      });
    })();
    return () => { cancelled = true; };
  }, [siteKey]);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
    if (status.msg) setStatus({ type: "", msg: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      // Validación de captcha
      if (siteKey) {
        if (!recaptchaToken) throw new Error("Por favor completa el captcha");
      } else {
        const a = Number(captchaA), b = Number(captchaB), ans = Number(captchaAnswer);
        if (!Number.isFinite(ans) || ans !== a + b) throw new Error("Captcha inválido");
      }

      const payload = {
        ...formData,
        recaptcha: recaptchaToken || undefined,
        captchaA: siteKey ? undefined : captchaA,
        captchaB: siteKey ? undefined : captchaB,
        captchaAnswer: siteKey ? undefined : captchaAnswer,
      };

      const response = await sendMessage(payload);
      if (!response || !response.success) throw new Error(response?.error || "Hubo un error al enviar el correo.");

      setStatus({ type: "success", msg: "Correo enviado correctamente!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setRecaptchaToken("");
      if (widgetIdRef.current != null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch {
          // no hacer nada
        }
      }
      if (!siteKey) {
        setCaptchaAnswer("");
        const a2 = Math.floor(Math.random() * 8) + 1; const b2 = Math.floor(Math.random() * 8) + 1;
        setCaptchaA(a2); setCaptchaB(b2);
      }
    } catch (error) {
      console.error("Error enviando mensaje de contacto:", error);
      setStatus({ type: "error", msg: error?.message || "Hubo un error al enviar el correo. Inténtalo nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  const subtleInput = "input input-bordered w-full focus:outline-none focus:ring-1 focus:ring-base-300 focus:border-base-300";
  const subtleTextarea = "textarea textarea-bordered w-full focus:outline-none focus:ring-1 focus:ring-base-300 focus:border-base-300";

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold">Contáctanos</h1>
          <p className="mt-2 text-base-content/70">Resolvemos dudas, coordinamos visitas y respondemos siempre. Si no ves nuestra respuesta, revisa la carpeta de spam.</p>
        </header>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <aside className="order-2 lg:order-1" aria-labelledby="info-contacto">
            <section className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h2 id="info-contacto" className="card-title text-xl">¿Hablemos?</h2>
                <div className="prose prose-invert max-w-none text-base">
                  <p>¿Te gustaría una visita educativa con nuestro planetario de Astromanía en tu colegio o institución? <strong>(Disponible solo para Chile).</strong></p>
                  <p>¿O quizás quieres hacernos una consulta astronómica, o preguntar a una astrónoma(o)?</p>
                  <p>¿Te gustaría tener uno de nuestros originales astrojuegos de mesa?</p>
                  <p>¡No dudes en escribirnos! Recuerda poner en el cuerpo del correo toda la información necesaria para que te podamos responder correctamente.</p>
                  <p>¡Siempre contestamos todos los mensajes! Si no te ha llegado el nuestro, te aconsejamos revisar la carpeta de spam.</p>
                </div>
                <div className="divider my-1" />
                <p className="text-base-content/70">Tiempo de respuesta habitual: 24–48 h hábiles.</p>
              </div>
            </section>
          </aside>

          <section className="order-1 lg:order-2" aria-labelledby="form-contacto">
            <h2 id="form-contacto" className="sr-only">Formulario de contacto</h2>
            <form onSubmit={handleSubmit} className="bg-neutral shadow-xl rounded-xl border border-base-300 p-6 lg:p-7 space-y-4" noValidate>
              <div className="form-control">
                <label className="label justify-between" htmlFor="name">
                  <span className="label-text">Nombre <span className="text-error">*</span></span>
                </label>
                <input id="name" type="text" name="name" placeholder="Tu nombre" value={formData.name} onChange={handleChange} className={subtleInput} required autoComplete="name" aria-describedby="hint-name" />
              </div>

              <div className="form-control">
                <label className="label justify-between" htmlFor="email">
                  <span className="label-text">Correo electrónico <span className="text-error">*</span></span>
                </label>
                <input id="email" type="email" name="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} className={subtleInput} required autoComplete="email" inputMode="email" aria-describedby="hint-email" />
              </div>

              <div className="form-control">
                <label className="label justify-between" htmlFor="subject">
                  <span className="label-text">Asunto <span className="text-error">*</span></span>
                  <span id="hint-subject" className="label-text-alt text-base-content/60">Ej: Visita planetario</span>
                </label>
                <input id="subject" type="text" name="subject" placeholder="Asunto" value={formData.subject} onChange={handleChange} className={subtleInput} required autoComplete="off" aria-describedby="hint-subject" />
              </div>

              <div className="form-control">
                <label className="label justify-between" htmlFor="message">
                  <span className="label-text">Mensaje <span className="text-error">*</span></span>
                  <span id="hint-message" className="label-text-alt text-base-content/60">Incluye fechas y lugar si aplica</span>
                </label>
                <textarea id="message" name="message" placeholder="Escribe tu mensaje…" value={formData.message} onChange={handleChange} className={subtleTextarea} rows={6} required aria-describedby="hint-message" />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Verificación</span></label>
                {siteKey ? (
                  <div>
                    <div ref={recaptchaRef} className="g-recaptcha" />
                    <p className="mt-2 text-xs opacity-70">Este sitio está protegido por reCAPTCHA y se aplican la Política de Privacidad y las Condiciones de Servicio de Google.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="opacity-80">¿Cuánto es {captchaA} + {captchaB}?</span>
                    <input type="number" inputMode="numeric" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="input input-bordered w-24" placeholder="Respuesta" required />
                  </div>
                )}
              </div>

              {status.msg && (
                <div role="alert" className={`alert ${status.type === "success" ? "alert-success" : "alert-error"}`}>
                  <span>{status.msg}</span>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" className={`btn btn-secondary w-full ${loading ? "btn-disabled" : ""}`} disabled={loading} aria-busy={loading}>
                  {loading ? (<><span className="loading loading-spinner loading-sm mr-2" /> Enviando…</>) : ("Enviar")}
                </button>
                <p className="mt-2 text-xs text-base-content/70 text-center">Al enviar, aceptas que te contactemos a tu correo. No compartimos tus datos.</p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

