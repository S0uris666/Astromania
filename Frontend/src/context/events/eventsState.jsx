import EventContext from "./eventsContext"
import { useReducer, useCallback } from "react";
import EventReducer from "./eventsReducer";
import { getEvents } from "../../api/auth";


//endporint de la api aqui
const EventState = (props) => {
  const initialState = {
    Event: [ ],
  };


  const[globalState, dispatch]=useReducer(EventReducer,initialState) //dispatch genera la accion Crud


//aqui va las funciones que gestionan el crud

const getAllEvents = useCallback(async () => {
  try {
    const res = await getEvents();
    //ver que se manda al reducer por que no aparece en el front?
    const payload = Array.isArray(res.data) ? res.data
                  : Array.isArray(res.data?.data) ? res.data.data
                  : [];

    console.log("[EV] raw axios data =", res.data);
    console.log("[EV] payload array? =", Array.isArray(payload), "length =", payload.length);
    
    if (payload[0]) {
      console.log("[EV] sample event =", payload[0]);
      console.log("[EV] sample startDateTime =", payload[0].startDateTime, "type:", typeof payload[0].startDateTime);
      console.log("[EV] sample endDateTime =", payload[0].endDateTime, "type:", typeof payload[0].endDateTime);
    }

    dispatch({ type: "GET_EVENTS", payload });
  } catch (error) {
    console.error("[EV] getAllEvents error:", error?.response?.data || error.message);
    console.error("[EV] Error details:", error?.response || error);
    dispatch({ type: "GET_EVENTS", payload: [] });
  }
}, []);



  return (<EventContext.Provider    /* //todo lo que este en value se podra usar en cualquier componente hijo */
                                                 
    value={{Event:globalState.Event,
    getAllEvents
    }}>    
                                              
    {props.children}


    </EventContext.Provider>)
};


export default EventState;