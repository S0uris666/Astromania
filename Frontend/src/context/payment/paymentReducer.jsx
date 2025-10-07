import { ACTIONS } from "./ActionState.js";

const PaymentReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_PREFERENCE:
      return { ...state, preference: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.CLEAR_PREFERENCE:
      return { ...state, preference: null };
    default:
      return state;
  }
};

export default PaymentReducer;
