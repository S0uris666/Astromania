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
    }
}

export default ServiceProductReducer;