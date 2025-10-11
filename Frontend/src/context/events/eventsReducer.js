const EventReducer = (globalState, action) => {
  switch (action.type) {
    case "GET_EVENTS":
      return {
        ...globalState,
        Event: Array.isArray(action.payload) ? action.payload : [],
      };

    case "CREATE_EVENT": {
      const created = action.payload || null;
      
      return {
        ...globalState,
        Event: created ? [created, ...(globalState.Event || [])] : (globalState.Event || []),
      };
    }

    case "UPDATE_EVENT": {
      const updated = action.payload || {};
      const id = updated?._id;
      if (!id) return globalState;

      return {
        ...globalState,
        Event: (globalState.Event || []).map((ev) =>
          ev?._id === id ? { ...ev, ...updated } : ev
        ),
      };
    }

    case "DELETE_EVENT": {
      // admite string id o { _id }
      const id = typeof action.payload === "string" ? action.payload : action.payload?._id;
      if (!id) return globalState;

      return {
        ...globalState,
        PrivateEvents: (globalState.Event || []).filter((ev) => ev?._id !== id),
      };
    }



    default:
      return globalState;

          case "GET_PRIVATE_EVENTS":
      return {
        ...globalState,
        PrivateEvents: Array.isArray(action.payload) ? action.payload : [],
      };


  }
};

export default EventReducer;



