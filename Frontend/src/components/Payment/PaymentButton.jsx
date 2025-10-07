import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { useState} from "react";
import { usePayment } from "../../context/payment/paymentContext";

// Inicializar MercadoPago con la clave pública
const PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;
initMercadoPago(PUBLIC_KEY);

export const PaymentButton = ({ 
  items, 
  buttonText = "Pagar con MercadoPago",
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
      if (onError) onError(err);
    }
  };

  const handleClose = () => {
    setShowWallet(false);
    setPreferenceId(null);
  };

  if (showWallet && preferenceId) {
    return (
      <div className="payment-wallet-container">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Completa tu pago</h3>
          <button 
            onClick={handleClose}
            className="btn btn-ghost btn-sm"
          >
            ✕
          </button>
        </div>
        
        <Wallet 
          initialization={{ 
            preferenceId: preferenceId,
            redirectMode: "self"
          }}
          customization={{
            texts: {
              valueProp: 'smart_option'
            }
          }}
          onSubmit={onSuccess}
          onError={onError}
          onReady={() => console.log("Wallet ready")}
        />
      </div>
    );
  }

  return (
    <div className="payment-button-container">
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`btn btn-primary ${className} ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Procesando...
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};