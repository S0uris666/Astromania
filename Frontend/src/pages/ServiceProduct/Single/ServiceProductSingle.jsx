import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";
import { UserContext } from "../../../context/user/UserContext";

const currencyCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const clp = (n) => (typeof n === "number" ? currencyCLP.format(n) : "A cotizar");

// Placeholders
const PLACEHOLDER_PRODUCT = "https://placehold.co/1200x800?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/1200x800?text=Servicio";


const cloudinaryContain = (urlOrId, { w = 1400, h = 1050 } = {}) => {
  if (!urlOrId) return null;
  // URL completa
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace(
      "/upload/",
      `/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_${w},h_${h}/`
    );
  }
  // Public ID
  const cloud = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloud) {
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_${w},h_${h}/${urlOrId}`;
  }
  return null;
};

// Normaliza imágenes a [{src, alt}]
const normalizeImages = (sp) => {
  const imgs = sp?.images ?? [];
  const fallback = {
    src: sp?.type === "product" ? PLACEHOLDER_PRODUCT : PLACEHOLDER_SERVICE,
    alt: sp?.title || "Sin imagen",
  };

  if (!imgs.length) return [fallback];

  // Esquema nuevo
  if (typeof imgs[0] === "object") {
    return imgs
      .map((im) => {
        const base = im?.url || im?.public_id;
        if (!base) return null;
        const src = cloudinaryContain(base) || base;
        return { src, alt: im?.alt || sp?.title || "Imagen" };
      })
      .filter(Boolean);
  }

  // Esquema antiguo: strings
  return imgs
    .map((s) => {
      const src = cloudinaryContain(s) || s;
      return { src, alt: sp?.title || "Imagen" };
    })
    .filter(Boolean);
};

// Miniaturas cuadradas (también contenidas)
const thumbContain = (srcOrId) => cloudinaryContain(srcOrId, { w: 360, h: 360 }) || srcOrId;

export const ServiceProductSingle = () => {
  const { slug: paramSlugOrId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { addToCart } = useContext(UserContext);
  const { serviceProduct = [], getSP } = useContext(ServiceProductContext);

  const spFromState = location?.state?.serviceProduct || null;

  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(!spFromState);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!spFromState) await getSP();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [spFromState, getSP]);

  const sp = useMemo(() => {
    if (spFromState) return spFromState;
    if (!serviceProduct?.length) return null;
    return (
      serviceProduct.find((p) => p.slug === paramSlugOrId) ||
      serviceProduct.find((p) => p._id === paramSlugOrId) ||
      null
    );
  }, [spFromState, serviceProduct, paramSlugOrId]);

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

  if (!sp) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="opacity-70 mb-6">No encontramos este elemento.</p>
        <Link to="/servicios-productos-list" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const imgs = normalizeImages(sp);
  const main = imgs[selected] || imgs[0];
  const isProduct = sp.type === "product";
  const hasStock = !isProduct || Number(sp.stock) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* breadcrumb simple */}
      <nav className="text-sm breadcrumbs mb-4 mt-15">
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/servicios-productos-list">Catálogo</Link></li>
          <li className="truncate max-w-[50ch]">{sp.title}</li>
        </ul>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <section className="space-y-4">
          {/* Marco limpio y contenido sin recorte */}
          <figure className="relative rounded-2xl border border-base-300 bg-base-200/70 overflow-hidden">
            <div className="aspect-[4/3] w-full grid place-items-center">
              <img
                src={main.src}
                alt={main.alt}
                className="max-w-full max-h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-base-100/20" />
          </figure>

          {/* Miniaturas */}
          {imgs.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {imgs.map((im, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={[
                    "rounded-xl overflow-hidden border transition-all",
                    i === selected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-base-300 hover:border-base-200"
                  ].join(" ")}
                >
                  <div className="aspect-square bg-base-200 grid place-items-center">
                    <img
                      src={thumbContain(im.src)}
                      alt={im.alt}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section>
          <h1 className="text-3xl font-bold tracking-tight">{sp.title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`badge ${isProduct ? "badge-primary/90" : "badge-secondary/90"} font-medium`}
            >
              {isProduct ? "Producto" : "Servicio"}
            </span>
            {isProduct && (
              <span className={`badge ${hasStock ? "badge-success/90" : "badge-error/90"}`}>
                {hasStock ? `Stock: ${sp.stock}` : "Sin stock"}
              </span>
            )}
          </div>

          {/* Precio */}
          <div className="mt-5 text-3xl font-semibold tracking-tight">
            {isProduct ? clp(sp.price) : (sp.price ? clp(sp.price) : "A cotizar")}
          </div>

          {/* Descripciones */}
          {sp.shortDescription && (
            <p className="mt-4 text-base-content/80 leading-relaxed">{sp.shortDescription}</p>
          )}
          {sp.description && (
            <div className="mt-3 prose prose-sm max-w-none text-base-content/90 whitespace-pre-line">
              {sp.description}
            </div>
          )}

          {/* Tags */}
          {!!sp.tags?.length && (
            <div className="mt-5 flex flex-wrap gap-2">
              {sp.tags.map((t) => (
                <span key={t} className="badge badge-ghost">#{t}</span>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-7 flex flex-wrap gap-3">
            {isProduct ? (
              <button
                className="btn btn-primary"
                disabled={!hasStock}
                onClick={() => addToCart(sp)}
                title={hasStock ? "Añadir al carrito" : "Sin stock"}
              >
                Añadir al carrito
              </button>
            ) : (
              <Link to="/contacto" className="btn btn-primary">
                Agendar / Consultar
              </Link>
            )}

            <button className="btn btn-ghost" onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>

          {/* Metadatos opcionales */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {sp.category && (
              <div><span className="opacity-60">Categoría: </span>{sp.category}</div>
            )}
            {sp.delivery && (
              <div><span className="opacity-60">Entrega/Formato: </span>{sp.delivery}</div>
            )}
            {sp.durationMinutes && (
              <div><span className="opacity-60">Duración: </span>{sp.durationMinutes} min</div>
            )}
            {sp.capacity && (
              <div><span className="opacity-60">Capacidad: </span>{sp.capacity} personas</div>
            )}
            {!!sp.locations?.length && (
              <div className="sm:col-span-2">
                <span className="opacity-60">Ubicaciones: </span>{sp.locations.join(", ")}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
