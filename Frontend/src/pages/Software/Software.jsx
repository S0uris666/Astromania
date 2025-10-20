import { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  Clapperboard,
  Satellite,
  Film,
  MonitorPlay,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

import { SOFTWARE_ITEMS } from "../../data/SoftwareData.jsx";
import { filterByCategoryAndQuery } from "../../utils/filters.js";

const TYPE_OPTIONS = [
  { value: "all", label: "Todos", icon: <Sparkles className="w-4 h-4" /> },
  {
    value: "documentales",
    label: "Documentales",
    icon: <Clapperboard className="w-4 h-4" />,
  },
  {
    value: "canales",
    label: "Canales y archivos",
    icon: <Satellite className="w-4 h-4" />,
  },
  { value: "ficcion", label: "Ficción", icon: <Film className="w-4 h-4" /> },
  {
    value: "series",
    label: "Series",
    icon: <MonitorPlay className="w-4 h-4" />,
  },
];

const TYPE_LABEL = TYPE_OPTIONS.reduce(
  (acc, opt) => ((acc[opt.value] = opt.label), acc),
  {}
);

const CATEGORY_DESCRIPTION = {
  all: "Explora documentales, canales oficiales, ficción y series que acercan el universo desde múltiples formatos.",
  documentales:
    "Producciones que narran misiones, telescopios y descubrimientos con rigor científico.",
  canales:
    "Canales y archivos oficiales con contenido actualizado, transmisiones y material descargable.",
  ficcion:
    "Historias inspiradas en la astronomía que combinan ciencia, narrativa y visuales inmersivos.",
  series:
    "Series documentales y docudramas que profundizan en misiones y futuros posibles en el espacio.",
};

export function Software() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const catalogue = useMemo(() => SOFTWARE_ITEMS, []);

  const filtered = useMemo(
    () =>
      filterByCategoryAndQuery(catalogue, type, query, {
        categorySelector: (item) => item?.category,
        fieldSelector: (item) => [
          item?.title,
          item?.provider,
          item?.description,
        ],
      }),
    [catalogue, type, query]
  );

  const handleClearFilters = () => {
    setQuery("");
    setType("all");
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <header className="max-w-3xl mt-15">
          <h1 className="text-3xl lg:text-4xl">Software y recursos audiovisuales</h1>
          <p className="mt-2 text-base text-base-content/80">
            Selección curada de documentales, canales oficiales, series y ficciones
            que amplifican el aprendizaje de la astronomía con experiencias visuales,
            narrativas y herramientas contrastadas.
          </p>
        </header>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="input input-bordered flex items-center gap-2 w-full md:max-w-md bg-base-100">
            <Search className="w-4 h-4 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Buscar por título, autor o descripción…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar en catálogo de software"
            />
          </label>

          <div className="join join-vertical sm:join-horizontal w-full sm:w-auto">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`btn btn-sm join-item w-full sm:w-auto ${
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

        {/* Meta */}
        <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <p className="text-base-content/70 sm:flex-1">
            {CATEGORY_DESCRIPTION[type]}
          </p>
          <span className="text-xs uppercase tracking-wide text-base-content/60 sm:ml-auto">
            Mostrando {filtered.length} de {catalogue.length} recursos
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState onClear={handleClearFilters} />
        ) : (
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((item) => (
              <li key={item.id} className="h-full">
                <SoftwareCard item={item} badge={TYPE_LABEL[item.category]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SoftwareCard({ item, badge }) {
  const { title, provider, description = "", cover, link, linkLabel } = item || {};
  const [expanded, setExpanded] = useState(false);
  const desc = (description ?? "").trim();
  const isValidUrl = typeof link === "string" && /^https?:\/\//i.test(link);

  const THRESHOLD = 140;
  const needsToggle = useMemo(() => desc.length > THRESHOLD, [desc]);
  const shortText = useMemo(() => desc.slice(0, THRESHOLD), [desc]);
  const truncated = useMemo(
    () => (needsToggle ? `${shortText}...` : desc),
    [needsToggle, shortText, desc]
  );

  return (
    <article className="card h-full flex flex-col bg-base-100 border border-base-300/70 hover:border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
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
          <span className="text-sm text-base-content/60">Imagen no disponible</span>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </figure>

      <div className="card-body flex flex-col">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="card-title text-lg sm:text-xl leading-tight">
            {title || "Título no disponible"}
          </h3>

          {!!badge && (
            <span className="badge badge-ghost capitalize self-start sm:self-auto">
              {badge}
            </span>
          )}
        </div>



        {provider && (
          <p className="mt-1 text-sm font-medium text-base-content/70">
            {provider}
          </p>
        )}

        {!!desc && (
          <div className="mt-2 text-sm text-base-content/80">
            <p className={!expanded ? "line-clamp-3" : ""}>
              {expanded ? desc : truncated}
            </p>

            {needsToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="group mt-3 inline-flex items-center gap-2 text-secondary text-xs font-semibold tracking-wide uppercase"
                aria-expanded={expanded}
                aria-label={
                  expanded ? "Ver menos descripción" : "Ver más descripción"
                }
              >
                <span>{expanded ? "Ver menos" : "Ver más"}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border border-secondary transition-transform duration-300 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown className="w-3 h-3" />
                </span>
              </button>
            )}
          </div>
        )}

        <div className="card-actions mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-4 border-t border-base-200">
          {isValidUrl ? (
            <>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm normal-case"
                title="Abrir recurso"
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
            <button
              type="button"
              className="btn btn-disabled btn-sm normal-case"
              title="Enlace no disponible"
            >
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
