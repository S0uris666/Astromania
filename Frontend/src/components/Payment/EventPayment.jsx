import { PaymentButton } from "./PaymentButton";
import { useUser } from "../../context/user/UserContext";

export const EventPayment = ({ event, onPaymentSuccess, onPaymentError }) => {
  const { user } = useUser();

  if (!event || event.price === 0) {
    return null; // No mostrar si el evento es gratuito
  }

  const paymentItems = [
    {
      title: `Inscripción: ${event.title}`,
      price: event.price,
      quantity: 1,
      description: `Inscripción para el evento ${event.title} - ${new Date(event.startDateTime).toLocaleDateString()}`
    }
  ];

  const payerInfo = {
    name: user?.username || "",
    email: user?.email || ""
  };

  const handlePaymentSuccess = (data) => {
    console.log("Pago exitoso:", data);
    if (onPaymentSuccess) {
      onPaymentSuccess(data);
    }
  };

  const handlePaymentError = (error) => {
    console.error("Error en el pago:", error);
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  return (
    <div className="mt-4 p-4 bg-base-200 rounded-xl">
      <h4 className="font-semibold mb-2">Inscripción al evento</h4>
      <div className="flex items-center justify-between mb-4">
        <span>Costo de inscripción:</span>
        <span className="text-lg font-bold text-primary">
          ${event.price.toLocaleString('es-CL')} CLP
        </span>
      </div>
      
      <PaymentButton
        items={paymentItems}
        buttonText="Inscribirse y Pagar"
        className="w-full"
        payerInfo={payerInfo}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        disabled={!user}
      />
      
      {!user && (
        <p className="text-sm text-base-content/60 mt-2 text-center">
          Debes <a href="/login" className="link link-primary">iniciar sesión</a> para inscribirte
        </p>
      )}
    </div>
  );
};
