import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ServiceProductContext from "../../../context/serviceProducts/ServiceProductContext";
import { UserContext } from "../../../context/user/UserContext";

const currencyCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const clp = (n) => (typeof n === "number" ? currencyCLP.format(n) : "A cotizar");

// Placeholders
const PLACEHOLDER_PRODUCT = "https://placehold.co/1200x800?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/1200x800?text=Servicio";

// Mini helper: si es Cloudinary, devuelve variante optimizada
const cloudinaryTransf = (urlOrId, { w = 1200, h = 800, fill = true } = {}) => {
  if (!urlOrId) return null;
  // URL completa
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    const mode = fill ? `c_fill,` : "";
    return urlOrId.replace("/upload/", `/upload/f_auto,q_auto,${mode}w_${w},h_${h}/`);
  }
  // Public ID
  const cloud = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloud) {
    const mode = fill ? `c_fill,` : "";
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,${mode}w_${w},h_${h}/${urlOrId}`;
  }
  return null;
};

// Devuelve [{src, alt}] a partir del esquema nuevo o antiguo
const normalizeImages = (sp) => {
  const imgs = sp?.images ?? [];
  if (!imgs.length) {
    return [{
      src: sp?.type === "product" ? PLACEHOLDER_PRODUCT : PLACEHOLDER_SERVICE,
      alt: sp?.title || "Sin imagen",
    }];
  }
  // nuevo esquema
  if (typeof imgs[0] === "object") {
    return imgs
      .map((im) => {
        const base = im?.url || im?.public_id || null;
        const src = cloudinaryTransf(base, { w: 1200, h: 800, fill: true }) || base;
        return src ? { src, alt: im?.alt || sp?.title || "Imagen" } : null;
      })
      .filter(Boolean);
  }
  // antiguo: strings
  return imgs
    .map((s) => {
      const src = cloudinaryTransf(s, { w: 1200, h: 800, fill: true }) || s;
      return { src, alt: sp?.title || "Imagen" };
    })
    .filter(Boolean);
};

// Miniaturas
const thumbSrc = (srcOrPublicId) =>
  cloudinaryTransf(srcOrPublicId, { w: 160, h: 160, fill: true }) || srcOrPublicId;

export const ServiceProductSingle = () => {
  const { slug: paramSlugOrId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { addToCart } = useContext(UserContext);
  const { serviceProduct = [], getSP } = useContext(ServiceProductContext);

  // Preferimos el item del state (viene fresco desde la lista)
  const spFromState = location?.state?.serviceProduct || null;

  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(!spFromState);

  // Asegura catálogo cargado cuando entramos directo por URL
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!spFromState) {
        await getSP();
      }
      if (mounted) setLoading(false);
    })();
    return () => (mounted = false);
  }, [spFromState, getSP]);

  // Busca por slug o id si no vino por state
  const sp = useMemo(() => {
    if (spFromState) return spFromState;
    if (!serviceProduct?.length) return null;
    // match por slug o _id
    return (
      serviceProduct.find((p) => p.slug === paramSlugOrId) ||
      serviceProduct.find((p) => p._id === paramSlugOrId) ||
      null
    );
  }, [spFromState, serviceProduct, paramSlugOrId]);

  // loading / not found
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mt-15 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-base-200 h-96 animate-pulse" />
          <div className="space-y-3">
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
  const hasStock = !isProduct || (Number(sp.stock) > 0);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería */}
        <section className="space-y-3">
          <figure className="aspect-[3/2] bg-base-200 rounded-2xl overflow-hidden">
            <img
              src={main.src}
              alt={main.alt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </figure>

          {imgs.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {imgs.map((im, i) => (
                <button
                  key={i}
                  type="button"
                  className={`rounded-xl overflow-hidden border ${i === selected ? "border-primary" : "border-base-300"}`}
                  onClick={() => setSelected(i)}
                >
                  <img
                    src={thumbSrc(im.src)}
                    alt={im.alt}
                    className="w-full h-full object-cover aspect-square"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        <section>
          <h1 className="text-3xl font-bold">{sp.title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <span className={`badge ${isProduct ? "badge-primary" : "badge-secondary"}`}>
              {isProduct ? "Producto" : "Servicio"}
            </span>
            {isProduct && (
              <span className={`badge ${hasStock ? "badge-success" : "badge-error"}`}>
                {hasStock ? `Stock: ${sp.stock}` : "Sin stock"}
              </span>
            )}
          </div>

          {/* Precio */}
          <div className="mt-4 text-2xl font-semibold">
            {isProduct ? clp(sp.price) : (sp.price ? clp(sp.price) : "A cotizar")}
          </div>

          {/* Descripciones */}
          {sp.shortDescription && (
            <p className="mt-3 text-base-content/80">{sp.shortDescription}</p>
          )}
          {sp.description && (
            <div className="mt-3 prose prose-sm max-w-none text-base-content/90 whitespace-pre-line">
              {sp.description}
            </div>
          )}

          {/* Tags */}
          {!!sp.tags?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sp.tags.map((t) => (
                <span key={t} className="badge badge-ghost">#{t}</span>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-6 flex flex-wrap gap-3">
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
              <>
                {/* Para servicios puedes linkear a reserva/contacto */}
                <Link to="/contacto" className="btn btn-primary">
                  Agendar / Consultar
                </Link>
              </>
            )}

            <button
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </div>

          {/* Metadatos opcionales */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
