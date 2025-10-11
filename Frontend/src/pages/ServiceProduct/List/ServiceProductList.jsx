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

const cloudinaryThumb = (urlOrId) => {
  if (!urlOrId) return null;
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1000,h_750/"
    );
  }
  const cloudName = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1000,h_750/${urlOrId}`;
  }
  return null;
};

const getCoverData = (sp) => {
  const first = sp?.images?.[0];
  if (first && (first.url || first.public_id)) {
    const srcOptim = cloudinaryThumb(first.url || first.public_id);
    const src = srcOptim || first.url || null;
    const alt = first.alt || sp.title || "Imagen";
    if (src) return { src, alt };
  }
  if (Array.isArray(sp?.images) && typeof sp.images[0] === "string") {
    const srcOptim = cloudinaryThumb(sp.images[0]);
    const src = srcOptim || sp.images[0];
    return { src, alt: sp.title || "Imagen" };
  }
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
      <header className="mt-15 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Servicios y Productos</h1>
        <p className="text-base-content/70 mt-1">Explora el catálogo de Astromanía ✨</p>
      </header>

      {!items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-base-300/60 bg-base-200/50 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-base-300" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-2/3 bg-base-300 rounded" />
                <div className="h-4 w-full bg-base-300 rounded" />
                <div className="h-4 w-3/4 bg-base-300 rounded" />
                <div className="mt-2 h-10 w-28 bg-base-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {items.map((sp) => {
            const isProduct = sp.type === "product";
            const href = `/servicios-productos/${sp.slug || sp._id}`;
            const { src: coverSrc, alt: coverAlt } = getCoverData(sp);

            return (
              <article
                key={sp._id}
                className="group rounded-2xl border border-base-300/60 bg-neutral shadow-sm hover:shadow-xl hover:border-base-300 transition-all overflow-hidden"
              >
                {/* Imagen contenida, sin recorte */}
                <figure className="relative aspect-[4/3] bg-base-300/70">
                  <div className="absolute inset-0 grid place-items-center">
                    <img
                      src={coverSrc}
                      alt={coverAlt}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  {/* Borde superior sutil */}
                  <div className="absolute inset-x-0 top-0 h-px bg-base-100/20" />
                </figure>

                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge badge-sm font-medium ${
                        isProduct ? "badge-primary/90" : "badge-secondary/90"
                      }`}
                    >
                      {isProduct ? "Producto" : "Servicio"}
                    </span>
                    {isProduct && (
                      <span
                        className={`badge badge-sm ${
                          sp.stock > 0 ? "badge-success/90" : "badge-error/90"
                        }`}
                      >
                        {sp.stock > 0 ? `Stock: ${sp.stock}` : "Sin stock"}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold mt-3 leading-tight group-hover:opacity-90">
                    {sp.title}
                  </h2>

                  {(sp.shortDescription || sp.description) && (
                    <p className="mt-2 text-sm text-base-content/80 leading-relaxed">
                      {truncate(sp.shortDescription || sp.description, 140)}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xl font-semibold tracking-tight">
                      {isProduct ? fmtPrice(sp.price) : (sp.price ? fmtPrice(sp.price) : "A cotizar")}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={href}
                        state={{ serviceProduct: sp }}
                        className="btn btn-sm btn-primary"
                      >
                        Ver más
                      </Link>

                      {isProduct && sp.stock > 0 && (
                        <button
                          type="button"
                          onClick={() => addToCart(sp)}
                          className="btn btn-sm btn-outline"
                          title="Añadir al carrito"
                        >
                          Añadir
                        </button>
                      )}
                    </div>
                  </div>

                  {!!sp.tags?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sp.tags.slice(0, 4).map((t) => (
                        <span key={t} className="badge badge-ghost badge-sm">
                          {t}
                        </span>
                      ))}
                      {sp.tags.length > 4 && (
                        <span className="badge badge-ghost badge-sm">+{sp.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
