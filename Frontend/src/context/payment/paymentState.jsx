// src/context/payment/PaymentState.jsx
import { useReducer } from "react";
import { PaymentContext } from "./paymentContext";
import PaymentReducer from "./paymentReducer";
import { createPaymentPreference, getPaymentStatus } from "../../api/payment"; 
import { initialState, ACTIONS } from "./ActionState.js";

const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(PaymentReducer, initialState);

  const setLoading = (v) => dispatch({ type: ACTIONS.SET_LOADING, payload: v });
  const setError = (msg) => dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
  const setPreference = (pref) => dispatch({ type: ACTIONS.SET_PREFERENCE, payload: pref });

  const clearError = () => dispatch({ type: ACTIONS.CLEAR_ERROR });
  const clearPreference = () => dispatch({ type: ACTIONS.CLEAR_PREFERENCE });

  const createPreference = async (items, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const preferenceData = await createPaymentPreference(items, options);
      setPreference(preferenceData);
      return preferenceData;
    } catch (err) {
      setError(err?.message || "Error al crear la preferencia de pago");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    setLoading(true);
    setError(null);
    try {
      const status = await getPaymentStatus(paymentId);
      return status;
    } catch (err) {
      setError(err?.message || "Error al verificar el estado del pago");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading: state.loading,
    error: state.error,
    preference: state.preference,
    createPreference,
    checkPaymentStatus,
    clearError,
    clearPreference,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;
