import { Link } from "react-router-dom";

export const PaymentFailure = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="card-title justify-center text-error">
            Pago Fallido
          </h2>
          
          <p className="text-base-content/70 mb-4">
            Hubo un problema al procesar tu pago. Puedes intentar nuevamente.
          </p>

          <div className="card-actions justify-center">
            <Link to="/" className="btn btn-primary">
              Volver al inicio
            </Link>
            <Link to="/servicios-productos-list" className="btn btn-ghost">
              Intentar nuevamente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};