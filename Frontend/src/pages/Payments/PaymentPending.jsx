import { useNavigate } from "react-router-dom";

export const PaymentPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="card-title justify-center text-warning">Pago Pendiente</h2>

          <p className="text-base-content/70 mb-4">
            Tu pago está siendo procesado. Te notificaremos cuando esté completado.
          </p>

          <div className="alert alert-info mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Esto puede tomar unos minutos dependiendo del método de pago.</span>
          </div>

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

