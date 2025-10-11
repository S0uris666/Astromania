import ServiceProductContext from "./ServiceProductContext";
import { useReducer, useCallback, useMemo } from "react";
import ServiceProductReducer from "./ServiceProductReducer";
import {
  getServiceProducts,
  createServiceProduct,
  updateServiceProduct,
  deleteServiceProduct,
} from "../../api/auth";

const ServiceProductState = ({ children }) => {
  const initialState = {
    serviceProduct: [],
  };

  const [globalState, dispatch] = useReducer(ServiceProductReducer, initialState);

  // ---- Helpers
  const pickArray = (res) => {
    // Normaliza posibles formatos de respuesta
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const pickDoc = (res) => {
    // Normaliza respuesta de create/update (documento creado/actualizado)
    return res?.data?.event ?? res?.data ?? null;
  };

  // ---- CRUD

  // LISTAR
  const getSP = useCallback(async () => {
    try {
      const res = await getServiceProducts();
      const payload = pickArray(res);
      dispatch({ type: "GET_SERVICE_PRODUCTS", payload });
      return payload;
    } catch (error) {
      console.error("[ServiceProducts] getSP error:", error?.response?.data || error);
      // Opcional: limpiar lista si falla
      dispatch({ type: "GET_SERVICE_PRODUCTS", payload: [] });
      throw error;
    }
  }, []);

  // CREAR 
  const createSP = useCallback(async (formDataOrJson) => {
    try {
      const res = await createServiceProduct(formDataOrJson);
      const created = pickDoc(res);
      if (!created) throw new Error("Respuesta inválida al crear");
      dispatch({ type: "CREATE_SERVICE_PRODUCT", payload: created });
      return created;
    } catch (error) {
      console.error("[ServiceProducts] createSP error:", error?.response?.data || error);
      throw error;
    }
  }, []);

  // ACTUALIZAR 
  const updateSP = useCallback(async (id, formDataOrJson) => {
    try {
      const res = await updateServiceProduct(id, formDataOrJson);
      const updated = pickDoc(res);
      if (!updated) throw new Error("Respuesta inválida al actualizar");
      dispatch({ type: "UPDATE_SERVICE_PRODUCT", payload: updated });
      return updated;
    } catch (error) {
      console.error("[ServiceProducts] updateSP error:", error?.response?.data || error);
      throw error;
    }
  }, []);

  // ELIMINAR
  const deleteOneServiceProduct = useCallback(async (id) => {
    try {
      await deleteServiceProduct(id);
      dispatch({ type: "DELETE_SERVICE_PRODUCT", payload: id });
      return true;
    } catch (error) {
      console.error("[ServiceProducts] deleteOneServiceProduct error:", error?.response?.data || error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      serviceProduct: globalState.serviceProduct,
      getSP,
      createSP,
      updateSP,
      deleteOneServiceProduct,
    }),
    [globalState.serviceProduct, getSP, createSP, updateSP, deleteOneServiceProduct]
  );

  return (
    <ServiceProductContext.Provider value={value}>
      {children}
    </ServiceProductContext.Provider>
  );
};

export default ServiceProductState;