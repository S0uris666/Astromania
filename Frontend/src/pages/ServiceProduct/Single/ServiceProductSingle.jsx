import { useLocation } from 'react-router-dom'

export const ServiceProductSingle = () => {
  const location = useLocation();
  const serviceProduct = location?.state?.serviceProduct;

  if (!serviceProduct) {
    return (
      <main className="max-w-7xl mx-auto pt-16 pb-24 px-8">
        <p className="text-gray-500">No se encontró información de este servicio o producto.</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto pt-16 pb-24 px-8 lg:grid lg:grid-cols-2 lg:gap-x-16">
      <section>
        <h1 className="text-4xl font-bold">{serviceProduct.title}</h1>
        <div className="mt-4">
          <p className="text-gray-500">{serviceProduct.description}</p>
        </div>
        <div className="mt-4">
          <h1 className="text-3xl">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
              .format(serviceProduct.price)}
          </h1>
        </div>
      </section>
      <figure className="mt-8 col-start-2 row-span-2">
        {/* Si luego agregas imágenes */}
        {/* <img
          src={serviceProduct.img}
          alt={serviceProduct.title}
          className="w-full object-center object-cover"
        /> */}
      </figure>
    </main>
  )
}
