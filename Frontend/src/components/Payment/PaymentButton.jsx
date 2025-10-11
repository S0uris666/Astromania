import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useState } from "react";
import { usePayment } from "../../context/payment/paymentContext";

// Inicializar MercadoPago con la clave pública
const PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
initMercadoPago(PUBLIC_KEY);

export const PaymentButton = ({
  items,
  buttonText = "Pagar con Mercado Pago",
  className = "",
  payerInfo = {},
  onSuccess,
  onError,
  disabled = false
}) => {
  const { createPreference, loading, error } = usePayment();
  const [preferenceId, setPreferenceId] = useState(null);
  const [showWallet, setShowWallet] = useState(false);

  const handlePayment = async () => {
    try {
      const backUrls = {
        success: `${window.location.origin}/payment/success`,
        failure: `${window.location.origin}/payment/failure`,
        pending: `${window.location.origin}/payment/pending`,
        payerName: payerInfo.name,
        payerEmail: payerInfo.email
      };
      const preference = await createPreference(items, backUrls);
      setPreferenceId(preference.id);
      setShowWallet(true);
    } catch (err) {
      console.error("Error al crear la preferencia:", err);
      onError?.(err);
    }
  };

  const handleClose = () => {
    setShowWallet(false);
    setPreferenceId(null);
  };

  if (showWallet && preferenceId) {
    return (
      <div className="payment-wallet-container w-full max-w-md rounded-2xl border border-base-300 bg-base-100/80 backdrop-blur p-4 shadow-lg animate-[fadeIn_.2s_ease-out]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MPBadge />
            <h3 className="text-base font-semibold">Completa tu pago</h3>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm rounded-full"
            aria-label="Cerrar pago"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-base-300 p-3">
          <Wallet
            initialization={{ preferenceId, redirectMode: "self" }}
            customization={{ texts: { valueProp: "smart_option" } }}
            onSubmit={onSuccess}
            onError={onError}
            onReady={() => console.log("Wallet ready")}
          />
        </div>

        <p className="mt-3 text-xs opacity-70">
          Serás redirigido de forma segura por Mercado Pago. No compartimos tus credenciales.
        </p>
      </div>
    );
  }

  return (
    <div className="payment-button-container inline-flex w-full max-w-md flex-col gap-2">
      {error && (
        <div className="alert alert-error shadow-sm">
          <span>{String(error)}</span>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={[
          "btn btn-primary btn-block gap-2",
          "rounded-xl shadow-md transition-all duration-150 active:scale-[0.98]",
          "hover:shadow-lg",
          disabled || loading ? "opacity-90 cursor-not-allowed" : "",
          className
        ].join(" ")}
        aria-busy={loading}
      >
        {/* Icono Mercado Pago inline (ligero y sin dependencias) */}
        {!loading && <MPLogo className="h-5 w-5" aria-hidden="true" />}

        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            Procesando…
          </span>
        ) : (
          buttonText
        )}
      </button>

      {/* Pie de confianza mini, opcional */}
      <div className="mx-auto text-center text-xs opacity-60">
        Pagos seguros con Mercado Pago
      </div>
    </div>
  );
};

/* ---------- UI helpers ---------- */

function MPLogo({ className = "" }) {
  // Logo simple estilo “doble gota” en SVG (neutral, funciona en dark/light)
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

function MPBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-2.5 py-1 text-xs">
      <MPLogo className="h-4 w-4" />
      Mercado Pago
    </span>
  );
}
