import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";
import { UserContext } from "../../../context/user/UserContext";

const formatPrice = (value) => {
  if (typeof value !== "number") return "A cotizar";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);
};

const PLACEHOLDER_PRODUCT = "https://placehold.co/1200x800?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/1200x800?text=Servicio";
const PLACEHOLDER_ACTIVITY = "https://placehold.co/1200x800?text=Actividad";

const TYPE_LABEL = {
  product: "Producto",
  service: "Servicio",
  activity: "Actividad",
};

const cloudinaryLarge = (urlOrId) => {
  if (!urlOrId) return null;
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace(
      "/upload/",
      "/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1400,h_900/"
    );
  }
  const cloud = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloud) {
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_1400,h_900/${urlOrId}`;
  }
  return null;
};

const cloudinaryThumb = (urlOrId) =>
  cloudinaryLarge(urlOrId)?.replace("w_1400,h_900", "w_360,h_360") || urlOrId;

const normalizeImages = (item) => {
  const images = item?.images ?? [];
  if (!images.length) {
    const type = String(item?.type || "").toLowerCase();
    const fallback =
      type === "service"
        ? PLACEHOLDER_SERVICE
        : type === "activity"
        ? PLACEHOLDER_ACTIVITY
        : PLACEHOLDER_PRODUCT;
    return [{ src: fallback, alt: item?.title || "Imagen" }];
  }
  if (typeof images[0] === "object") {
    return images
      .map((img) => {
        const base = img?.url || img?.public_id;
        if (!base) return null;
        return {
          src: cloudinaryLarge(base) || base,
          alt: img?.alt || item?.title || "Imagen",
        };
      })
      .filter(Boolean);
  }
  return images
    .map((src) => ({
      src: cloudinaryLarge(src) || src,
      alt: item?.title || "Imagen",
    }))
    .filter(Boolean);
};

const normalizeLinks = (links = []) =>
  links
    .map((link) => {
      if (typeof link === "string") {
        const url = link.trim();
        return url ? { label: "Ver recurso", url } : null;
      }
      if (link && typeof link === "object") {
        const url = (link.url || "").trim();
        if (!url) return null;
        return { label: (link.label || link.title || "Ver recurso").trim() || "Ver recurso", url };
      }
      return null;
    })
    .filter(Boolean);

export const ServiceProductSingle = () => {
  const { slug: param } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(UserContext);
  const { serviceProduct = [], getSP } = useContext(ServiceProductContext);

  const initial = location?.state?.serviceProduct || null;
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!initial) await getSP();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [initial, getSP]);

  const normalizedParam = useMemo(() => {
    try {
      return decodeURIComponent(param ?? "");
    } catch {
      return param ?? "";
    }
  }, [param]);

  const item = useMemo(() => {
    if (initial) return initial;
    if (!serviceProduct?.length) return null;
    return (
      serviceProduct.find((entry) => entry.slug === normalizedParam) ||
      serviceProduct.find(
        (entry) => String(entry._id || entry.id) === String(normalizedParam)
      ) ||
      null
    );
  }, [initial, serviceProduct, normalizedParam]);

  const itemId = useMemo(
    () => (item?._id || item?.id ? String(item._id || item.id) : null),
    [item?._id, item?.id]
  );

  useEffect(() => {
    setSelected(0);
  }, [itemId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mt-15 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl border border-base-300 bg-base-200 h-[480px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-base-200 rounded" />
            <div className="h-4 w-3/4 bg-base-200 rounded" />
            <div className="h-4 w-1/2 bg-base-200 rounded" />
            <div className="h-10 w-40 bg-base-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="opacity-70">No encontramos este elemento.</p>
        <Link to="/servicios-productos-list" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const type = String(item.type || "").toLowerCase();
  const images = normalizeImages(item);
  const mainImage = images[selected] || images[0];
  const links = normalizeLinks(item.links);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const serviceLocations = Array.isArray(item.locations) ? item.locations : [];

  const handleAddToCart = () => addToCart(item);
  const hasStock = typeof item.stock === "number" ? item.stock > 0 : false;

  const breadcrumbs = [
    { label: "Inicio", to: "/" },
    { label: "Servicios y Productos", to: "/servicios-productos-list" },
    { label: item.title || "(Sin título)" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <nav className="mt-10 text-sm breadcrumbs opacity-70">
        <ul>
          {breadcrumbs.map((bread, index) =>
            bread.to ? (
              <li key={index}>
                <Link to={bread.to}>{bread.label}</Link>
              </li>
            ) : (
              <li key={index} className="truncate max-w-[12rem] md:max-w-none">
                {bread.label}
              </li>
            )
          )}
        </ul>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10">
        <section className="space-y-4">
          <figure className="rounded-2xl border border-base-300 bg-base-200 overflow-hidden">
            <div className="aspect-[4/3] w-full grid place-items-center">
              <img
                src={mainImage.src}
                alt={mainImage.alt}
                className="max-w-full max-h-full object-contain"
                loading="eager"
              />
            </div>
          </figure>

          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {images.map((img, index) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    index === selected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-base-300 hover:border-base-200"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <div className="aspect-square bg-base-200 grid place-items-center">
                    <img
                      src={cloudinaryThumb(img.src)}
                      alt={img.alt}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <header className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="badge badge-secondary/90">{TYPE_LABEL[type] || type}</span>
              {type === "product" && (
                <span className={`badge badge-sm ${hasStock ? "badge-success/90" : "badge-error/90"}`}>
                  {hasStock ? `Stock: ${item.stock}` : "Sin stock"}
                </span>
              )}
              {type === "service" && item.durationMinutes ? (
                <span className="badge badge-ghost badge-sm">
                  Duración: {item.durationMinutes} min
                </span>
              ) : null}
              {type === "service" && item.capacity ? (
                <span className="badge badge-ghost badge-sm">
                  Capacidad: {item.capacity} personas
                </span>
              ) : null}
              {type === "activity" && item.location ? (
                <span className="badge badge-ghost badge-sm">{item.location}</span>
              ) : null}
              {item.active === false && <span className="badge badge-outline">No disponible</span>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>
            {item.shortDescription ? (
              <p className="text-base text-base-content/80 leading-relaxed">{item.shortDescription}</p>
            ) : null}
          </header>

          {item.description ? (
            <div className="prose prose-sm max-w-none text-base-content/90 whitespace-pre-line">
              {item.description}
            </div>
          ) : null}

          {links.length ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Enlaces relacionados
              </h2>
              <div className="flex flex-wrap gap-2">
                {links.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="badge badge-ghost">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {type === "product" ? (
              <>
                <span className="text-3xl font-semibold tracking-tight">
                  {formatPrice(item.price)}
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={!hasStock}
                    onClick={handleAddToCart}
                    title={hasStock ? "Añadir al carrito" : "Sin stock disponible"}
                  >
                    Añadir al carrito
                  </button>
                  <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    Volver
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-semibold tracking-tight">
                  {formatPrice(item.price)}
                </span>
                <div className="flex gap-2">
                  <Link to="/contacto" className="btn btn-primary">
                    Contactar
                  </Link>
                  <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                    Volver
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-base-content/80">
            {item.category ? <div>Categoría: {item.category}</div> : null}
            {type === "product" && item.delivery ? <div>Entrega: {item.delivery}</div> : null}
            {type === "service" && serviceLocations.length ? (
              <div className="sm:col-span-2">
                Ubicaciones: {serviceLocations.join(", ")}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};
