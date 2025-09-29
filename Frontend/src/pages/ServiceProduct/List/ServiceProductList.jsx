import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";

const currencyCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

const fmtPrice = (n) => (typeof n === "number" ? currencyCLP.format(n) : "A cotizar");

const truncate = (s = "", n = 120) => (s.length > n ? s.slice(0, n) + "…" : s);

export const ServiceProductList = () => {
  const { serviceProduct = [], getSP } = useContext(ServiceProductContext);

  useEffect(() => { getSP(); }, [getSP]);

  const items = useMemo(() => serviceProduct, [serviceProduct]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mt-15 mb-6">
        <h1 className="text-3xl font-bold">Servicios y Productos</h1>
        <p className="text-base-content/70">Explora el catálogo de Astromanía ✨</p>
      </header>

      {!items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card bg-base-200 shadow animate-pulse">
              <div className="h-40 bg-base-300 rounded-t-xl" />
              <div className="card-body">
                <div className="h-6 w-2/3 bg-base-300 rounded" />
                <div className="h-4 w-full bg-base-300 rounded" />
                <div className="h-4 w-3/4 bg-base-300 rounded" />
                <div className="mt-4 h-10 w-24 bg-base-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((sp) => {
            const isProduct = sp.type === "product";
            const href = `/servicios-productos/${sp.slug || sp._id}`;
            const cover =
              sp.images?.[0] ||
              (isProduct
                ? "https://placehold.co/600x400?text=Producto"
                : "https://placehold.co/600x400?text=Servicio");

            return (
              <div key={sp._id} className="card bg-neutral shadow-xl hover:shadow-2xl transition-shadow">
                <figure className="aspect-[3/2] overflow-hidden">
                  <img src={cover} alt={sp.title} className="w-full h-full object-cover" />
                </figure>

                <div className="card-body">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${isProduct ? "badge-primary" : "badge-secondary"}`}>
                      {isProduct ? "Producto" : "Servicio"}
                    </span>

                  </div>

                  <h2 className="card-title mt-1">{sp.title}</h2>
                  {sp.shortDescription || sp.description ? (
                    <p className="text-sm text-base-content/80">
                      {truncate(sp.shortDescription || sp.description, 140)}
                    </p>
                  ) : null}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      {isProduct ? fmtPrice(sp.price) : (sp.price ? fmtPrice(sp.price) : "A cotizar")}
                    </div>
                    {isProduct && (
                      <div className={`badge ${sp.stock > 0 ? "badge-success" : "badge-error"}`}>
                        {sp.stock > 0 ? `Stock: ${sp.stock}` : "Sin stock"}
                      </div>
                    )}
                  </div>

                  {!!sp.tags?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sp.tags.slice(0, 4).map((t) => (
                        <span key={t} className="badge badge-ghost">{t}</span>
                      ))}
                      {sp.tags.length > 4 && <span className="badge badge-ghost">+{sp.tags.length - 4}</span>}
                    </div>
                  )}

                  <div className="card-actions justify-between items-center mt-3">
                    <Link to={href} state={{ serviceProduct: sp }} className="btn btn-primary btn-sm">
                      Ver más
                    </Link>
                    {isProduct && sp.stock > 0 && (
                      <button type="button" className="btn btn-outline btn-sm">
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};