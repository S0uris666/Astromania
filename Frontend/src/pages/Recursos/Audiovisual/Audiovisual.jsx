// src/pages/Audiovisual.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Telescope,
  Youtube,
  Images,
  Clapperboard,
  Tv,
  Search,
  Undo2,
  ExternalLink,
} from "lucide-react";

import { AUDIOVISUAL_ITEMS } from "../../../data/Audiovisual_data.jsx";
import { filterByCategoryAndQuery } from "../../../utils/filters.js";
/* ================== Hook: debounce ================== */
function useDebouncedValue(value, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ================== Config & Datos ================== */
const CATEGORY_OPTIONS = [
  { id: "all", label: "Todo", icon: <Sparkles className="w-4 h-4" /> },
  { id: "documentales", label: "Documentales astronómicos", icon: <Telescope className="w-4 h-4" /> },
  {
    id: "canales",
    label: "Canales de YouTube y archivos",
    icon: (
      <span className="inline-flex items-center gap-1">
        <Youtube className="w-4 h-4" />
        <Images className="w-3 h-3" />
      </span>
    ),
  },
  { id: "ficcion", label: "Cortos y ficción", icon: <Clapperboard className="w-4 h-4" /> },
  { id: "series", label: "Series de televisión", icon: <Tv className="w-4 h-4" /> },
];

const CATEGORY_LABEL = CATEGORY_OPTIONS.reduce((acc, o) => ((acc[o.id] = o.label), acc), {});



const CATEGORY_DESCRIPTION = {
  all: "Colección curada de documentales, series y canales para explorar el cosmos desde diferentes formatos.",
  documentales: "Documentales que cuentan historias reales de misiones, observatorios y descubrimientos astronómicos.",
  canales: "Canales de YouTube y repositorios con imágenes y videos descargables para tus actividades.",
  ficcion: "Cortos y películas de ciencia ficción que mezclan narrativa con conceptos inspirados en la astronomía.",
  series: "Series de televisión y docuseries que profundizan en ciencias espaciales con capítulos semanales.",
};

/* ================== Página ================== */
export function Audiovisual() {
  const [query, setQuery] = useState(() => localStorage.getItem("av_q") || "");
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem("av_cat") || "all");
  const [loadingCovers, setLoadingCovers] = useState({}); // id -> bool

  useEffect(() => localStorage.setItem("av_q", query), [query]);
  useEffect(() => localStorage.setItem("av_cat", activeCategory), [activeCategory]);

  const filteredItems = useMemo(
    () =>
      filterByCategoryAndQuery(AUDIOVISUAL_ITEMS, activeCategory, query, {
        fieldSelector: (item) => [item?.title, item?.provider, item?.description],
      }),
    [activeCategory, query]
  );

  const clearFilters = () => {
    setQuery("");
    setActiveCategory("all");
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Hero */}
        <header className="max-w-3xl space-y-3 mt-15 ">
          <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Audiovisual</h1>
          <p className="text-base lg:text-lg text-base-content/80">
            Descubre documentales, series, canales y archivos visuales para inspirar tus clases, talleres y momentos de divulgación.
          </p>
        </header>

        {/* Filtros */}
        <div className="mt-6 rounded-2xl border border-base-300 bg-base-100/80 shadow-sm px-4 py-4">
          <FilterBar
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            query={query}
            onQueryChange={setQuery}
            onClear={clearFilters}
          />
        </div>

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="text-base-content/70">{CATEGORY_DESCRIPTION[activeCategory]}</p>
          <span className="ml-auto text-xs uppercase tracking-wide text-base-content/60">
            Mostrando {filteredItems.length} de {AUDIOVISUAL_ITEMS.length} recursos
          </span>
        </div>

        {/* Grid / Empty */}
        {filteredItems.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {filteredItems.map((item) => (
              <li key={`${item.category}-${item.id}`}>
                <MediaCard
                  item={item}
                  categoryLabel={CATEGORY_LABEL[item.category]}
                  loadingCovers={loadingCovers}
                  setLoadingCovers={setLoadingCovers}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ================== Componentes ================== */

function FilterBar({ activeCategory, onChange, query, onQueryChange, onClear }) {
  const [localQ, setLocalQ] = useState(query);
  const debouncedQ = useDebouncedValue(localQ, 220);
  useEffect(() => onQueryChange(debouncedQ), [debouncedQ, onQueryChange]);

  const [focusedIndex, setFocusedIndex] = useState(
    Math.max(0, CATEGORY_OPTIONS.findIndex((c) => c.id === activeCategory))
  );

  const hasFilters = activeCategory !== "all" || (query?.trim()?.length ?? 0) > 0;

  const onKeyDownChips = (e) => {
    const max = CATEGORY_OPTIONS.length - 1;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(max, i + 1));
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(0, i - 1));
    }
  };

  useEffect(() => {
    const idx = CATEGORY_OPTIONS.findIndex((c) => c.id === activeCategory);
    if (idx !== -1) setFocusedIndex(idx);
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {/* Búsqueda */}
      <div className="flex items-stretch gap-3">
        <label className="input input-bordered flex items-center gap-2 w-full lg:max-w-md bg-base-100">
          <Search className="w-4 h-4 opacity-70" />
          <input
            type="search"
            className="grow"
            placeholder="Buscar por título, descripción o autor/canal…"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            aria-label="Buscar recursos audiovisuales"
          />
        </label>

        {hasFilters && (
          <button
            type="button"
            className="btn btn-ghost whitespace-nowrap"
            onClick={onClear}
            title="Limpiar filtros y búsqueda"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      {/* XS: select compacto */}
      <div className="sm:hidden">
        <select
          className="select select-bordered w-full"
          value={activeCategory}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filtrar por categoría"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ≥ sm: chips scrollables con fades */}
      <div className="hidden sm:block">
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-base-100 to-transparent rounded-l-xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-base-100 to-transparent rounded-r-xl" />

          <nav
            className="no-scrollbar overflow-x-auto -mx-2 px-2"
            aria-label="Categorías"
            role="tablist"
            onKeyDown={onKeyDownChips}
          >
            <div className="flex items-center gap-2 pb-1">
              {CATEGORY_OPTIONS.map((option, idx) => {
                const isActive = option.id === activeCategory;
                return (
                  <button
                    key={option.id}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={idx === focusedIndex ? 0 : -1}
                    onFocus={() => setFocusedIndex(idx)}
                    onClick={() => onChange(option.id)}
                    className={[
                      "btn btn-sm rounded-full transition-all",
                      isActive ? "btn-primary" : "btn-outline",
                    ].join(" ")}
                  >
                    <span className="mr-2 hidden md:inline-flex">{option.icon}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ item, categoryLabel, loadingCovers, setLoadingCovers }) {
  const { id, title, provider, description, cover, link, linkLabel } = item || {};
  const [expanded, setExpanded] = useState(false);

  const normalizedDescription = (description ?? "").trim();
  const THRESHOLD = 200;
  const needsToggle = useMemo(() => normalizedDescription.length > THRESHOLD, [normalizedDescription]);
  const previewDescription = useMemo(() => normalizedDescription.slice(0, THRESHOLD).trimEnd(), [normalizedDescription]);

  const isLoading = !!loadingCovers[id];

  return (
    <article className="group card bg-base-100 border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      {/* Poster con proporción fija */}
      <figure className="relative aspect-[16/10] bg-base-300/60">
        {(!cover || isLoading) && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="loading loading-spinner text-primary" />
          </div>
        )}

        {cover && (
          <img
            src={cover}
            alt={title ? `Arte promocional de ${title}` : "Portada del recurso"}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            decoding="async"
            onLoadStart={() => setLoadingCovers((s) => ({ ...s, [id]: true }))}
            onLoad={() => setLoadingCovers((s) => ({ ...s, [id]: false }))}
            onError={() => setLoadingCovers((s) => ({ ...s, [id]: false }))}
          />
        )}

        {categoryLabel && (
          <span className="absolute top-3 left-3 badge badge-primary badge-outline shadow-sm">{categoryLabel}</span>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </figure>

      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg sm:text-xl leading-snug">{title || "Título no disponible"}</h3>
          {!!link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs normal-case"
              title="Abrir recurso en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {provider && <p className="mt-0.5 text-sm font-medium text-base-content/70">{provider}</p>}

        {!!normalizedDescription && (
          <div className="mt-3 text-sm sm:text-[0.95rem] text-base-content/80">
            <p className={!expanded && needsToggle ? "line-clamp-3" : ""}>
              {expanded || !needsToggle ? normalizedDescription : `${previewDescription}…`}
            </p>

            {needsToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 btn btn-link btn-xs p-0 h-auto min-h-0 no-underline text-secondary"
                aria-expanded={expanded}
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        <div className="card-actions mt-4">
          {typeof link === "string" && link.length ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm normal-case"
              title={linkLabel || "Abrir recurso"}
            >
              {linkLabel || "Abrir recurso"}
            </a>
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

function EmptyState({ onClear }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-10 text-center">
      <h2 className="text-lg font-semibold">Sin resultados</h2>
      <p className="mt-2 text-sm text-base-content/70">
        Prueba con otra palabra clave o selecciona una categoría diferente.
      </p>
      <div className="mt-4">
        <button type="button" className="btn btn-outline btn-sm" onClick={onClear}>
          <Undo2 className="w-4 h-4 mr-2" />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
