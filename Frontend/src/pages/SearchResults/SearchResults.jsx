import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, RefreshCw, AlertTriangle, Calendar, Package } from "lucide-react";
import { searchAll } from "../../api/searchService.js";

// ===== Helpers para imágenes =====
const PLACEHOLDER_PRODUCT = "https://placehold.co/800x600?text=Imagen";

const cloudinaryContain = (urlOrId, { w = 800, h = 600 } = {}) => {
  if (!urlOrId) return null;
  if (typeof urlOrId === "string" && urlOrId.includes("/upload/")) {
    return urlOrId.replace(
      "/upload/",
      `/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_${w},h_${h}/`
    );
  }
  const cloud = import.meta.env.VITE_CLD_CLOUD_NAME;
  if (cloud) {
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_pad,b_auto:predominant,w_${w},h_${h}/${urlOrId}`;
  }
  return null;
};

const pickProductThumb = (p) => {
  const imgs = Array.isArray(p?.images) ? p.images : [];
  let base = null;
  let alt = p?.title || "";
  if (imgs.length) {
    const first = imgs[0];
    if (typeof first === "string") base = first;
    else if (first && typeof first === "object") base = first.url || first.public_id;
  }
  const src =
    cloudinaryContain(base, { w: 800, h: 600 }) ||
    base ||
    PLACEHOLDER_PRODUCT;
  return { src, alt };
};

// ====== Highlight simple (case-insensitive) ======
function Highlight({ text, query }) {
  const q = (query || "").trim();
  if (!q) return <>{text}</>;
  try {
    const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = String(text || "").split(regex);
    return (
      <>
        {parts.map((p, i) =>
          regex.test(p) ? (
            <mark key={i} className="rounded px-0.5 py-0 bg-warning/30">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ====== Skeletons ======
function ProductCardSkeleton() {
  return (
    <li className="card bg-base-200 border border-base-300 overflow-hidden animate-pulse">
      <div className="bg-base-300 h-40 sm:h-44" />
      <div className="card-body">
        <div className="h-5 w-3/4 bg-base-300 rounded" />
        <div className="h-4 w-5/6 bg-base-300 rounded mt-2" />
        <div className="h-8 w-28 bg-base-300 rounded mt-4" />
      </div>
    </li>
  );
}
function EventRowSkeleton() {
  return (
    <li className="p-4 rounded-xl bg-base-200 border border-base-300 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-1/2 bg-base-300 rounded" />
          <div className="h-4 w-5/6 bg-base-300 rounded" />
          <div className="h-3 w-1/3 bg-base-300 rounded" />
        </div>
        <div className="h-8 w-28 bg-base-300 rounded" />
      </div>
    </li>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const q = params.get("q") || "";

  const [query, setQuery] = useState(q);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({ products: [], events: [], pages: [] });
  const [tab, setTab] = useState("all"); // 'all' | 'products' | 'events'
  const [sort, setSort] = useState("relevance"); // 'relevance' | 'newest' (ejemplo simple)

  // Mantén query de la URL en el input
  useEffect(() => setQuery(q), [q]);

  const runSearch = useCallback(async () => {
    if (!q.trim()) {
      setResults({ products: [], events: [], pages: [] });
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await searchAll(q);
      setResults(res);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los resultados.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await runSearch();
    })();
    return () => {
      alive = false;
    };
  }, [runSearch]);

  const onSubmit = (e) => {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    navigate(`/buscar?q=${encodeURIComponent(v)}`);
  };

  // Contadores y datasets por tab
  const { products, events, pages } = results;
  const counts = {
    products: products.length,
    events: events.length,
    pages: pages.length,
    all: products.length + events.length + pages.length,
  };

  
  const sortedProducts = useMemo(() => {
    if (sort === "newest") {
      return [...products].sort((a, b) => Date.parse(b.updatedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.createdAt || 0));
    }
    return products; 
  }, [products, sort]);

  const sortedEvents = useMemo(() => {
    if (sort === "newest") {
      return [...events].sort((a, b) => Date.parse(b.startDateTime || 0) - Date.parse(a.startDateTime || 0));
    }
    return events;
  }, [events, sort]);

  const showProducts = tab === "all" || tab === "products";
  const showEvents = tab === "all" || tab === "events";
  const showPages = tab === "all"; // mostramos páginas solo en la vista "Todo"

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 mt-20">
      {/* Barra superior: búsqueda + tabs + sort */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/70 border-b border-base-300">
        <div className="max-w-6xl mx-auto flex flex-col gap-3">
          {/* Search bar */}
          <form onSubmit={onSubmit} className="w-full">
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar servicios, productos o eventos…"
                className="input input-bordered w-full pr-11"
                aria-label="Buscar"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-primary btn-sm px-3"
                aria-label="Buscar"
                title="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Tabs + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="tabs tabs-boxed bg-base-200">
              <button
                className={`tab ${tab === "all" ? "tab-active" : ""}`}
                onClick={() => setTab("all")}
              >
                Todo
                <span className="ml-2 badge badge-ghost">{counts.all}</span>
              </button>
              <button
                className={`tab ${tab === "products" ? "tab-active" : ""}`}
                onClick={() => setTab("products")}
              >
                <Package className="w-4 h-4 mr-2" />
                Productos
                <span className="ml-2 badge badge-ghost">{counts.products}</span>
              </button>
              <button
                className={`tab ${tab === "events" ? "tab-active" : ""}`}
                onClick={() => setTab("events")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
                <span className="ml-2 badge badge-ghost">{counts.events}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm opacity-70">Ordenar</label>
              <select
                className="select select-bordered select-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Ordenar resultados"
              >
                <option value="relevance">Relevancia</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Título + estados */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold">
          Resultados para “{q}”
        </h1>

        {loading && (
          <div className="mt-4">
            <p className="opacity-80">Buscando resultados…</p>
            {/* skeletons: 3 productos + 3 eventos de muestra */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
            <ul className="mt-6 space-y-3">
              <EventRowSkeleton />
              <EventRowSkeleton />
              <EventRowSkeleton />
            </ul>
          </div>
        )}

        {!!error && !loading && (
          <div className="alert alert-error mt-6">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <div className="ml-auto">
              <button
                className="btn btn-sm"
                onClick={() => runSearch()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && counts.all === 0 && (
          <div className="mt-8 p-6 rounded-xl bg-base-200 border border-base-300">
            <p className="text-lg font-semibold">No encontramos resultados 😕</p>
            <ul className="mt-3 text-sm opacity-80 list-disc pl-4">
              <li>Revisa la ortografía o intenta con términos más generales.</li>
              <li>Prueba con sinónimos (p. ej., “observación” → “astronomía”).</li>
              <li>Explora nuestro <Link to="/eventos" className="link link-primary">calendario de eventos</Link> o la sección de <Link to="/servicios-productos-list" className="link link-primary">servicios y productos</Link>.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Páginas estáticas */}
      {!loading && !error && showPages && counts.pages > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Páginas</h2>
            <span className="badge badge-ghost">{counts.pages} resultados</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((pg) => (
              <li key={pg.path} className="card bg-base-200 border border-base-300 hover:shadow-lg transition">
                <div className="card-body">
                  <h3 className="card-title text-base">{pg.title}</h3>
                  <div className="mt-2">
                    <Link to={pg.path} className="btn btn-ghost btn-sm">Abrir</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Productos */}
      {!loading && !error && showProducts && counts.products > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Servicios y Productos</h2>
            <span className="badge badge-ghost">{counts.products} resultados</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((p) => {
              const { src, alt } = pickProductThumb(p);
              const url = `/servicios-productos/${p.slug || p._id}`;
              return (
                <li key={p._id} className="group card bg-base-200 border border-base-300 overflow-hidden hover:shadow-lg transition">
                  <figure className="bg-base-300">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full h-44 object-cover transition group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-base line-clamp-2">
                      <Highlight text={p.title} query={q} />
                    </h3>
                    {p.shortDescription && (
                      <p className="text-sm opacity-80 line-clamp-3">
                        <Highlight text={p.shortDescription} query={q} />
                      </p>
                    )}
                    <div className="mt-3">
                      <Link
                        to={url}
                        state={{ serviceProduct: p }}
                        className="btn btn-primary btn-sm"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Eventos */}
      {!loading && !error && showEvents && counts.events > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Eventos</h2>
            <span className="badge badge-ghost">{counts.events} resultados</span>
          </div>
          <ul className="space-y-3">
            {sortedEvents.map((e) => {
              const start = e.startDateTime ? new Date(e.startDateTime) : null;
              const when = start
                ? start.toLocaleString("es-CL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Fecha por confirmar";
              const place = e.isOnline ? "Online" : (e.location || "—");
              return (
                <li key={e._id} className="p-4 rounded-xl bg-base-200 border border-base-300 hover:shadow-lg transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        <Highlight text={e.title} query={q} />
                      </h3>
                      {e.description && (
                        <p className="text-sm opacity-80 mt-1 line-clamp-3">
                          <Highlight text={e.description} query={q} />
                        </p>
                      )}
                      <p className="text-xs opacity-75 mt-2">
                        {place} • {when}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link to="/eventos" className="btn btn-ghost btn-sm">
                        Ver calendario
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
