import { createContext, useContext } from "react";

const EventsContext = createContext(null);
export default EventsContext;

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents debe usarse dentro de <EventsState />");
  return ctx;
};
