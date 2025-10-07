
import { createContext, useContext } from "react";

export const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment debe usarse dentro de un PaymentProvider");
  }
  return context;
};
