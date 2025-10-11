// src/context/events/eventsState.jsx
import EventContext from "./eventsContext";
import { useReducer, useCallback } from "react";
import EventReducer from "./eventsReducer";


import { getEvents, createEvent, updateEvent, deleteEvent, getPrivateEvent } from "../../api/auth";

const EventState = (props) => {
  const initialState = {
    Event: [],
  };

  const [globalState, dispatch] = useReducer(EventReducer, initialState);

  // --------- READ: obtener todos ---------
  const getAllEvents = useCallback(async () => {
    try {
      const res = await getEvents();
      // Normaliza: acepta { data: [...] } o [...]
      const payload = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      dispatch({ type: "GET_EVENTS", payload });
      return payload;
    } catch (error) {
      console.error("[Events] getAllEvents error:", error?.response?.data || error);
      dispatch({ type: "GET_EVENTS", payload: [] });
      return [];
    }
  }, []);

  // --------- CREATE: crear uno ---------
  const createOneEvent = useCallback(async (payload) => {
    try {
      const res = await createEvent(payload);
      // Normaliza: {data:{event}} | {data:{...}} | {...}
      const created = res?.data?.event ?? res?.data ?? res;
      dispatch({ type: "CREATE_EVENT", payload: created });
      return created;
    } catch (error) {
      console.error("[Events] createOneEvent error:", error?.response?.data || error);
      throw error;
    }
  }, []);

  // --------- UPDATE: actualizar uno ---------
  const updateOneEvent = useCallback(async (id, changes) => {
    try {
      const res = await updateEvent(id, changes); // PATCH/PUT según tu API
      const updated = res?.data?.event ?? res?.data ?? res;
      dispatch({ type: "UPDATE_EVENT", payload: updated });
      return updated;
    } catch (error) {
      console.error("[Events] updateOneEvent error:", error?.response?.data || error);
      throw error;
    }
  }, []);

  // --------- DELETE: eliminar uno ---------
  const deleteOneEvent = useCallback(async (id) => {
    try {
      await deleteEvent(id);
      dispatch({ type: "DELETE_EVENT", payload: id });
      return true;
    } catch (error) {
      console.error("[Events] deleteOneEvent error:", error?.response?.data || error);
      throw error;
    }
  }, []);



  // --------- READ: obtener todos los eventos privados ---------
  const getPrivateEvents = useCallback(async () => {
    try {
      const res = await getPrivateEvent();
      const payload = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      dispatch({ type: "GET_PRIVATE_EVENTS", payload });
      return payload;
    } catch (error) {
      console.error("[Events] getPrivateEvents error:", error?.response?.data || error);
      dispatch({ type: "GET_EVENTS", payload: [] });
      return [];
    }
  }, []);

  return (
    <EventContext.Provider
      value={{
        Event: globalState.Event,
        getAllEvents,
        createOneEvent,
        updateOneEvent,
        deleteOneEvent,
        PrivateEvents: globalState.PrivateEvents,
        getPrivateEvents,
        
      }}
    >
      {props.children}
    </EventContext.Provider>
  );
};

export default EventState;
