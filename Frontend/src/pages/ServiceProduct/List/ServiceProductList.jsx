import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";
import { UserContext } from "../../../context/user/UserContext";

const currencyCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const fmtPrice = (n) => (typeof n === "number" ? currencyCLP.format(n) : "A cotizar");
const truncate = (s = "", n = 120) => (s.length > n ? s.slice(0, n) + "…" : s);

// Placeholders
const PLACEHOLDER_PRODUCT = "https://placehold.co/900x600?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/900x600?text=Servicio";

// Si la imagen viene de Cloudinary, genera una miniatura optimizada 3:2
const cloudinaryThumb = (urlOrId) => {
  if (!urlOrId) return null;
  // Si es una URL completa con "/upload/"
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace("/upload/", "/upload/f_auto,q_auto,w_900,h_600,c_fill/");
  }
  // Si solo te llegara un public_id (no es tu caso habitual, pero lo soportamos)
  const cloudName = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_900,h_600,c_fill/${urlOrId}`;
  }
  return null;
};

// Obtiene src/alt considerando el nuevo esquema y compatibilidad retro
const getCoverData = (sp) => {
  // Nuevo esquema: [{ url, public_id, alt }]
  const first = sp?.images?.[0];
  if (first && (first.url || first.public_id)) {
    const srcOptim = cloudinaryThumb(first.url || first.public_id);
    const src = srcOptim || first.url || null;
    const alt = first.alt || sp.title || "Imagen";
    if (src) return { src, alt };
  }

  // Viejo esquema: images: [string]
  if (Array.isArray(sp?.images) && typeof sp.images[0] === "string") {
    const srcOptim = cloudinaryThumb(sp.images[0]);
    const src = srcOptim || sp.images[0];
    return { src, alt: sp.title || "Imagen" };
  }

  // Fallback por tipo
  return {
    src: sp?.type === "product" ? PLACEHOLDER_PRODUCT : PLACEHOLDER_SERVICE,
    alt: sp?.title || "Sin imagen",
  };
};

export const ServiceProductList = () => {
  const { addToCart } = useContext(UserContext);
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
            const { src: coverSrc, alt: coverAlt } = getCoverData(sp);

            return (
              <div key={sp._id} className="card bg-neutral shadow-xl hover:shadow-2xl transition-shadow">
                <figure className="aspect-[3/2] overflow-hidden">
                  <img src={coverSrc} alt={coverAlt} className="w-full h-full object-cover" />
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
                      <button
                        type="button"
                        onClick={() => addToCart(sp)}
                        className="btn btn-outline btn-sm"
                      >
                        Añadir al carrito
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
