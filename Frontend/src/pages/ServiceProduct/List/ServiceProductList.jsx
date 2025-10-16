import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";
import { UserContext } from "../../../context/user/UserContext";

const TYPE_FILTERS = [
  { value: "all", label: "Todo" },
  { value: "product", label: "Productos" },
  { value: "service", label: "Servicios" },
  { value: "activity", label: "Actividades" },
];

const TYPE_LABEL = {
  product: "Producto",
  service: "Servicio",
  activity: "Actividad",
};

const PLACEHOLDER_PRODUCT = "https://placehold.co/900x600?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/900x600?text=Servicio";
const PLACEHOLDER_ACTIVITY = "https://placehold.co/900x600?text=Actividad";

const currencyCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const formatPrice = (value) =>
  typeof value === "number" ? currencyCLP.format(value) : "A cotizar";

const cloudinaryContain = (urlOrId) => {
  if (!urlOrId) return null;
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1200,h_800/"
    );
  }
  const cloudName = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1200,h_800/${urlOrId}`;
  }
  return null;
};

const getCoverData = (item) => {
  const first = item?.images?.[0];
  if (first && (first.url || first.public_id)) {
    const src = cloudinaryContain(first.url || first.public_id) || first.url || null;
    if (src) return { src, alt: first.alt || item.title || "Imagen" };
  }
  if (Array.isArray(item?.images) && typeof item.images[0] === "string") {
    const src = cloudinaryContain(item.images[0]) || item.images[0];
    return { src, alt: item.title || "Imagen" };
  }
  const type = String(item?.type || "").toLowerCase();
  if (type === "service") return { src: PLACEHOLDER_SERVICE, alt: "Servicio" };
  if (type === "activity") return { src: PLACEHOLDER_ACTIVITY, alt: "Actividad" };
  return { src: PLACEHOLDER_PRODUCT, alt: "Producto" };
};

export const ServiceProductList = () => {
  const { addToCart } = useContext(UserContext);
  const { serviceProduct = [], getSP } = useContext(ServiceProductContext);

  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    getSP().catch(() => {});
  }, [getSP]);

  const items = useMemo(() => (Array.isArray(serviceProduct) ? serviceProduct : []), [serviceProduct]);

  const filtered = useMemo(() => {
    if (filterType === "all") return items.filter((item) => item.active !== false);
    return items.filter(
      (item) => item.active !== false && String(item.type || "").toLowerCase() === filterType
    );
  }, [items, filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="mt-15 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Servicios y Productos</h1>
        <p className="text-base text-base-content/70 max-w-3xl">
          Explora nuestro catálogo de productos, servicios y actividades preparados para acercar la astronomía a todas las edades.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {TYPE_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn btn-sm ${filterType === option.value ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilterType(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-xl border border-base-300 p-8 text-base-content/70 text-center">
          No encontramos elementos para esta categoría por ahora.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((item) => {
            const type = String(item.type || "").toLowerCase();
            const { src, alt } = getCoverData(item);
            const href = `/servicios-productos/${item.slug || item._id}`;
            const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4) : [];
            const priceLabel =
              type === "product" || type === "service"
                ? formatPrice(item.price)
                : undefined;
            const stockLabel =
              type === "product" && typeof item.stock === "number"
                ? item.stock > 0
                  ? `Stock: ${item.stock}`
                  : "Sin stock"
                : null;
            const infoService = [];
            if (type === "service") {
              if (item.durationMinutes) infoService.push(`Duración: ${item.durationMinutes} min`);
              if (item.capacity) infoService.push(`Capacidad: ${item.capacity} personas`);
              if (Array.isArray(item.locations) && item.locations.length) {
                infoService.push(`Ubicaciones: ${item.locations.join(", ")}`);
              }
            }
            const activityLocation =
              type === "activity" && item.location ? `Ubicación: ${item.location}` : null;

            return (
              <article
                key={item._id || item.id}
                className="group rounded-2xl border border-base-300/60 bg-neutral shadow-sm hover:shadow-xl hover:border-base-300 transition-all overflow-hidden"
              >
                <figure className="relative aspect-[4/3] bg-base-300/60">
                  <div className="absolute inset-0 grid place-items-center">
                    <img
                      src={src}
                      alt={alt}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </figure>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-secondary/90 font-medium">
                      {TYPE_LABEL[type] || type}
                    </span>
                    {type === "product" && stockLabel ? (
                      <span
                        className={`badge badge-sm ${
                          stockLabel.includes("Sin") ? "badge-error/90" : "badge-success/90"
                        }`}
                      >
                        {stockLabel}
                      </span>
                    ) : null}
                    {type === "service" && priceLabel ? (
                      <span className="badge badge-ghost badge-sm">{priceLabel}</span>
                    ) : null}
                    {type === "activity" && activityLocation ? (
                      <span className="badge badge-ghost badge-sm">{activityLocation}</span>
                    ) : null}
                  </div>

                  <h2 className="text-lg font-semibold leading-tight group-hover:opacity-90">
                    {item.title}
                  </h2>

                  {item.shortDescription && (
                    <p className="text-sm text-base-content/80 leading-relaxed line-clamp-4">
                      {item.shortDescription}
                    </p>
                  )}

                  {type === "product" && (
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{formatPrice(item.price)}</span>
                      {item.delivery ? <span className="opacity-70">{item.delivery}</span> : null}
                    </div>
                  )}

                  {type === "service" && infoService.length ? (
                    <ul className="text-xs text-base-content/70 space-y-1">
                      {infoService.map((info) => (
                        <li key={info}>{info}</li>
                      ))}
                    </ul>
                  ) : null}

                  {tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag} className="badge badge-ghost badge-sm">
                          #{tag}
                        </span>
                      ))}
                      {Array.isArray(item.tags) && item.tags.length > tags.length ? (
                        <span className="badge badge-ghost badge-sm">
                          +{item.tags.length - tags.length}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <Link
                      to={href}
                      state={{ serviceProduct: item }}
                      className="btn btn-primary btn-sm"
                    >
                      Ver detalles
                    </Link>

                    {type === "product" && item.stock > 0 && (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="btn btn-sm btn-outline"
                        title="Añadir al carrito"
                      >
                        Añadir
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
