import ServiceProductContext from "./ServiceProductContext";
import { useReducer } from "react";
import ServiceProductReducer from "./ServiceProductReducer";

//endporint de la api aqui
const ServiceProductState = (props) => {
  const initialState = {
    serviceProduct: [
      {
        id: 1,
        name: "Observación Astronómica",
        description:
          "Sesiones guiadas para observar el cielo nocturno con telescopios y binoculares.",
        price: 20,
        
        },
      {
        id: 2,
        name: "Charlas y Talleres",
        description:
          "Presentaciones educativas sobre astronomía, astrofísica y ciencias espaciales.",
        price: 15,
      
        },
    ],
  };

  const[globalState, dispatch]=useReducer(ServiceProductReducer,initialState) //dispatch genera la accion Crud

  return (<ServiceProductContext.Provider          /* //todo lo que este en value se podra usar en cualquier componente hijo */
    value={{serviceProduct:globalState.serviceProduct}}>    
                                              
    {props.children}


    </ServiceProductContext.Provider>)
};


export default ServiceProductState;