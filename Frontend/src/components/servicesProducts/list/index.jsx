import { useContext } from "react";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";

export const ServiceProductList = () => {
  const ctx = useContext(ServiceProductContext);
  console.log("contexto", ctx);
  const  {serviceProduct}  = ctx;
  return (

    <div>
      Lista de Servicios y Productos
      {serviceProduct.map((serviceProduct) => (
        <div key={serviceProduct.id}>
          <h2>{serviceProduct.name}</h2>
          <p>{serviceProduct.description}</p>
          <p>Precio: ${serviceProduct.price}</p>
        </div>
      ))}
    </div>
  );
};
