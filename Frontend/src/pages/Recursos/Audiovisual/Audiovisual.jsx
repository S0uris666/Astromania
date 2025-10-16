// src/pages/Audiovisual.jsx
import { useMemo, useState } from "react";
import {
  Sparkles,
  Telescope,
  Youtube,
  Images,
  Clapperboard,
  Tv,
  Search,
  ExternalLink,
} from "lucide-react";

import { AUDIOVISUAL_ITEMS } from "../../../data/Audiovisual_data.jsx";
import { filterByCategoryAndQuery } from "../../../utils/filters.js";

/* ================ Config: tipos  ================ */
const TYPE_OPTIONS = [
  { value: "all", label: "Todo", icon: <Sparkles className="w-4 h-4" /> },
  { value: "documentales", label: "Documentales", icon: <Telescope className="w-4 h-4" /> },
  {
    value: "canales",
    label: "Canales y archivos",
    icon: (
      <span className="inline-flex items-center gap-1">
        <Youtube className="w-4 h-4" />
        <Images className="w-3 h-3" />
      </span>
    ),
  },
  { value: "ficcion", label: "Cortos y ficción", icon: <Clapperboard className="w-4 h-4" /> },
  { value: "series", label: "Series de TV", icon: <Tv className="w-4 h-4" /> },
];

const TYPE_LABEL = TYPE_OPTIONS.reduce((acc, o) => ((acc[o.value] = o.label), acc), {});

/* ================== Página (mismo layout que Música) ================== */
export function Audiovisual() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(
    () =>
      filterByCategoryAndQuery(AUDIOVISUAL_ITEMS, type, query, {
        categorySelector: (item) => item?.category, // <-- equivalente a item.type en Música
        fieldSelector: (item) => [item?.title, item?.provider, item?.description],
      }),
    [query, type]
  );

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header (igual estilo) */}
        <header className="max-w-3xl mt-15">
          <h1 className="text-3xl lg:text-4xl">Audiovisual</h1>
          <p className="mt-2 text-base text-base-content/80">
            Descubre documentales, series, canales de YouTube y archivos visuales para inspirar tus
            clases, talleres y momentos de divulgación.
          </p>
        </header>

        {/* Search + Filters (idéntico patrón) */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <label className="input input-bordered flex items-center gap-2 w-full md:max-w-md bg-base-100">
            <Search className="w-4 h-4 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Buscar por título, autor/canal o descripción…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar recursos audiovisuales"
            />
          </label>

          <div className="join">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`btn btn-sm join-item ${
                  type === opt.value ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setType(opt.value)}
                aria-pressed={type === opt.value}
              >
                <span className="mr-2 hidden sm:inline-flex">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState onClear={() => { setQuery(""); setType("all"); }} />
        ) : (
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((item) => (
              <li key={`${item.category}-${item.id}`}>
                <MediaCard item={item} badge={TYPE_LABEL[item.category]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ================== Card (alineada a la de Música) ================== */
function MediaCard({ item, badge }) {
  const { title, provider, description = "", cover, link, linkLabel } = item || {};
  const [expanded, setExpanded] = useState(false);

  const THRESHOLD = 140; // igual que Música
  const normalized = description.trim();
  const needsToggle = normalized.length > THRESHOLD;
  const shortText = normalized.slice(0, THRESHOLD);

  return (
    <article className="card bg-base-100 border border-base-300/70 hover:border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      {/* Cabecera cuadrada para empatar el look */}
      <figure className="relative aspect-square bg-base-300/70 grid place-items-center p-4 sm:p-5">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="max-w-full max-h-full object-contain drop-shadow-sm"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="text-sm opacity-70">Sin portada</div>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </figure>

      <div className="card-body">
        <div className="flex items-center justify-between gap-3">
          <h3 className="card-title text-lg sm:text-xl leading-tight">
            {title || "Título no disponible"}
          </h3>
          {!!badge && <span className="badge badge-ghost capitalize">{badge}</span>}
        </div>

        {provider && (
          <p className="mt-0.5 text-sm font-medium text-base-content/70">{provider}</p>
        )}

        {!!normalized && (
          <div className="mt-1 text-sm text-base-content/80">
            <p className={!expanded ? "line-clamp-3" : ""}>
              {expanded ? normalized : needsToggle ? `${shortText}…` : normalized}
            </p>

            {needsToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 btn btn-link btn-xs p-0 h-auto min-h-0 no-underline text-secondary"
                aria-expanded={expanded}
                aria-label={expanded ? "Ver menos descripción" : "Ver más descripción"}
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        <div className="card-actions mt-4">
          {typeof link === "string" && link.length ? (
            <>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm normal-case"
                title={linkLabel || "Abrir recurso"}
              >
                {linkLabel || "Abrir recurso"}
              </a>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm normal-case"
                aria-label={`Abrir ${title} en nueva pestaña`}
                title="Abrir en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="sr-only">Abrir en nueva pestaña</span>
              </a>
            </>
          ) : (
            <button type="button" className="btn btn-disabled btn-sm normal-case" title="Enlace no disponible">
              Enlace no disponible
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ================== Empty (mismo tono visual) ================== */
function EmptyState({ onClear }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-10 text-center">
      <h2 className="text-lg font-semibold">Sin resultados</h2>
      <p className="mt-2 text-sm text-base-content/70">
        Prueba con otra palabra clave o selecciona otra categoría.
      </p>
      <div className="mt-4">
        <button type="button" className="btn btn-outline btn-sm" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
