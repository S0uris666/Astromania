import { createContext, useContext } from "react";

const ServiceProductsContext = createContext(null);
export default ServiceProductsContext;

export function useServiceProducts() {
  const ctx = useContext(ServiceProductsContext);
  if (!ctx) throw new Error("useServiceProducts debe usarse dentro de <ServiceProductsState>");
  return ctx;
}