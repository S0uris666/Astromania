const ServiceProductReducer = (globalState, action) => {
  switch (action.type) {
    case "GET_SERVICE_PRODUCTS":
      return {
        ...globalState,
        serviceProduct: action.payload,
      };
    // case "ADD_PRODUCT":
    default:
      return globalState;

    case "UPDATE_SERVICE_PRODUCT": {
      const updated = action.payload || {};
      const id = updated?._id;
      if (!id) return globalState;

      return {
        ...globalState,
        serviceProduct: (globalState.serviceProduct || []).map((sp) =>
          sp?._id === id ? { ...sp, ...updated } : sp
        ),
      };
    }

    case "DELETE_SERVICE_PRODUCT": {
      
      const id = typeof action.payload === "string" ? action.payload : action.payload?._id;
      if (!id) return globalState;

      return {
        ...globalState,
        serviceProduct: (globalState.serviceProduct || []).filter((sp) => sp?._id !== id),
      };
    }


        case "CREATE_SERVICE_PRODUCT": {
      const created = action.payload || null;
      
      return {
        ...globalState,
        serviceProduct: created ? [created, ...(globalState.serviceProduct || [])] : (globalState.serviceProduct || []),
      };
    }
  }
};

export default ServiceProductReducer;
