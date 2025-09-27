import { useContext , useEffect} from "react";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";


export const ServiceProductList = () => {
  const ctx = useContext(ServiceProductContext);
  console.log("contexto", ctx);
  const  {serviceProduct, getSP}  = ctx;
  useEffect(() => {
    getSP();
  }, [getSP]);

  return (

    <div>
      Lista de Servicios y Productos
      {serviceProduct.map((serviceProduct) => (
        <div key={serviceProduct.id}>
          <h2>{serviceProduct.title}</h2>
          <p>{serviceProduct.description}</p>
          <p>Precio: ${serviceProduct.price}</p>
          <Link to={`/servicios-productos/${serviceProduct._id}`} state={{ serviceProduct }} className="btn-product">
                    <button type="button" className="w-full">
                      Ver más
                    </button>
                  </Link>
        </div>
      ))}
    </div>
  );
};