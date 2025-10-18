import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePayment } from "../../context/payment/paymentContext";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { checkPaymentStatus } = usePayment();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const merchantOrderId = searchParams.get("merchant_order_id");

  useEffect(() => {
    const getPaymentInfo = async () => {
      if (paymentId) {
        try {
          const info = await checkPaymentStatus(paymentId);
          setPaymentInfo(info);
        } catch (error) {
          console.error("Error al obtener información del pago:", error);
        }
      }
      setLoading(false);
    };

    getPaymentInfo();
  }, [paymentId, checkPaymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p>Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="card-title justify-center text-success">
            ¡Pago Exitoso!
          </h2>
          
          <p className="text-base-content/70 mb-4">
            Tu pago ha sido procesado correctamente.
          </p>

          {paymentInfo && (
            <div className="bg-base-200 p-4 rounded-lg mb-4 text-left">
              <h3 className="font-semibold mb-2">Detalles del pago:</h3>
              <p><strong>ID de pago:</strong> {paymentId}</p>
              <p><strong>Estado:</strong> {status}</p>
              {merchantOrderId && (
                <p><strong>Orden:</strong> {merchantOrderId}</p>
              )}
            </div>
          )}

          <div className="card-actions justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/servicios-productos-list")}
            >
              Ver más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
