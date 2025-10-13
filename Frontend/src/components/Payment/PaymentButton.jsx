// PaymentRedirectButton.jsx
import { useState } from "react";
import { usePayment } from "../../context/payment/paymentContext";

/**
 * Botón de pago minimalista con redirección inmediata a Mercado Pago (Web Checkout).
 * - Crea la preferencia en  backend.
 * - Redirige automáticamente a preference.init_point (o sandbox_init_point).
 * - Muestra estado de carga y errores con DaisyUI.
 */
export function PaymentButton({
  items,
  payerInfo = {},
  buttonText = "Pagar con Mercado Pago",
  className = "",
  disabled = false,
  onError,
}) {
  const { createPreference, loading: ctxLoading, error: ctxError } = usePayment();
  const [localLoading, setLocalLoading] = useState(false);
  const loading = ctxLoading || localLoading;

  const handleClick = async () => {
    try {
      setLocalLoading(true);

      // back_urls para tu app
      const back_urls = {
        success: `${window.location.origin}/payment/success`,
        failure: `${window.location.origin}/payment/failure`,
        pending: `${window.location.origin}/payment/pending`,
      };

      // Si tu contexto acepta (items, back_urls), mantenemos la firma:
      const preference = await createPreference(items, {
        ...back_urls,
        // Si tu backend lo usa, puedes enviar datos del pagador como metadata:
        payerName: payerInfo.name,
        payerEmail: payerInfo.email,
      });

      // Mercado Pago devuelve init_point (producción) y sandbox_init_point (sandbox):
      const checkoutUrl =
        preference?.init_point || preference?.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error("No se recibió la URL de checkout (init_point).");
      }

      // Redirigir inmediatamente
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Error al iniciar el pago:", err);
      onError?.(err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="inline-flex w-full max-w-md flex-col gap-2">
      {ctxError && (
        <div className="alert alert-error shadow-sm">
          <span>{String(ctxError)}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={[
          "btn btn-primary btn-block gap-2 rounded-xl shadow-md",
          "transition-all duration-150 active:scale-[0.98] hover:shadow-lg",
          disabled || loading ? "opacity-90 cursor-not-allowed" : "",
          className,
        ].join(" ")}
        aria-busy={loading}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            Procesando…
          </span>
        ) : (
          <>
            <MPLogo className="h-5 w-5" aria-hidden="true" />
            {buttonText}
          </>
        )}
      </button>

      <p className="mx-auto text-center text-xs opacity-60">
        Serás redirigido de forma segura por Mercado Pago.
      </p>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function MPLogo({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="Mercado Pago"
    >
      <path d="M12 2c5.5 0 10 2.9 10 6.5S17.5 15 12 15 2 12.1 2 8.5 6.5 2 12 2zm0 2C7.6 4 4 6 4 8.5S7.6 13 12 13s8-2 8-4.5S16.4 4 12 4z" />
      <path d="M7.5 8.5c0-.8.7-1.5 1.5-1.5h.3c.5 0 1 .2 1.3.6l.4.4.4-.4c.3-.4.8-.6 1.3-.6h.3c.8 0 1.5.7 1.5 1.5 0 .4-.2.8-.5 1.1l-1.5 1.5c-.5.5-1.3.5-1.8 0L8 9.6c-.3-.3-.5-.7-.5-1.1z" />
    </svg>
  );
}
