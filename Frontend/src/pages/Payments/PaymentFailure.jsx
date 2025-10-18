import { useNavigate } from "react-router-dom";

export const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="card-title justify-center text-error">Pago Fallido</h2>

          <p className="text-base-content/70 mb-4">
            Hubo un problema al procesar tu pago. Puedes intentar nuevamente.
          </p>

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
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
