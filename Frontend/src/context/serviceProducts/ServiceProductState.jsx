import ServiceProductContext from "./ServiceProductContext";
import { useReducer, useCallback } from "react";
import ServiceProductReducer from "./ServiceProductReducer";
import { getServiceProducts } from "../../api/auth";


//endporint de la api aqui
const ServiceProductState = (props) => {
  const initialState = {
    serviceProduct: [ ],
  };


  const[globalState, dispatch]=useReducer(ServiceProductReducer,initialState) //dispatch genera la accion Crud


//aqui va las funciones que gestionan el crud

 const getSP = useCallback(async () => {
    try {
      const res = await getServiceProducts();
      console.log("colección de productos y servicios", res);
      dispatch({ type: "GET_PRODUCTS", payload: res.data });
    } catch (error) {
      console.error("Error obteniendo productos y servicios", error);
    }
  }, []); // dispatch es estable, no hace falta incluirlo



  return (<ServiceProductContext.Provider    /* //todo lo que este en value se podra usar en cualquier componente hijo */
                                                 
    value={{serviceProduct:globalState.serviceProduct,
    getSP
    }}>    
                                              
    {props.children}


    </ServiceProductContext.Provider>)
};


export default ServiceProductState;