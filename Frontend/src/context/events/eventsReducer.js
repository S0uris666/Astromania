const EventReducer = (globalState, action) => {
    switch (action.type) {
        case "GET_EVENTS":
            console.log("[EV] reducer GET_EVENTS payload:", action.payload);
            return {
                ...globalState,
                Event:  Array.isArray(action.payload) ? action.payload : [] ,
            };
        
        default:
            return globalState;
    }
}

export default EventReducer


