import { useMemo, useState } from "react";
import {
  Search,
  Library,
  GraduationCap,
  Sparkles,
  BookOpenText,
} from "lucide-react";

import { literatura_aprendizaje } from "../../../data/Literatura_aprendizaje.jsx";
import { literatura_cuento } from "../../../data/Literatura_cuento.jsx";
import { literatura_novela } from "../../../data/Literatura_novela.jsx";

const CATEGORY_OPTIONS = [
  {
    id: "all",
    label: "Todos",
    icon: <Library className="w-4 h-4" />,
  },
  {
    id: "aprendizaje",
    label: "Aprendizaje",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: "cuentos",
    label: "Juvenil y cuentos",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "novelas",
    label: "Novelas y textos",
    icon: <BookOpenText className="w-4 h-4" />,
  },
];

const CATEGORY_LABEL = CATEGORY_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.id]: option.label }),
  {}
);

const CATEGORY_DESCRIPTION = {
  all: "Explora libros de divulgación, cuentos y novelas que conectan con el universo desde distintos formatos.",
  aprendizaje:
    "Guías, manuales y material de divulgación para aprender astronomía paso a paso.",
  cuentos:
    "Relatos ilustrados y novelas gráficas que inspiran a niñas, niños y jóvenes.",
  novelas:
    "Clásicos y obras contemporáneas de ciencia ficción y aventuras espaciales.",
};

export function Literatura() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const catalogue = useMemo(
    () => [
      ...literatura_aprendizaje,
      ...literatura_cuento,
      ...literatura_novela,
    ],
    []
  );

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalogue.filter((book) => {
      const matchesCategory =
        activeCategory === "all" || book.category === activeCategory;

      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const fieldsToCheck = [
        book?.title ?? "",
        book?.autor ?? "",
        book?.description ?? "",
      ];

      return fieldsToCheck.some((field) =>
        field.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeCategory, catalogue, query]);

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 ">
        <header className="max-w-3xl space-y-3 mt-15">
          <h1 className="text-3xl lg:text-5xl">Literatura</h1>
          <p className="text-base lg:text-lg text-base-content/80">
            Selección de novelas, cuentos, cómics y libros de aprendizaje para
            viajar por el universo desde tu lugar favorito.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-6">
          <FilterBar
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            query={query}
            onQueryChange={setQuery}
          />

          <p className="text-sm sm:text-base text-base-content/70">
            {CATEGORY_DESCRIPTION[activeCategory]}
          </p>

          <p className="text-xs uppercase tracking-wide text-base-content/60">
            Mostrando {filteredBooks.length} de {catalogue.length} títulos
          </p>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="mt-12 rounded-box border border-dashed border-base-300 bg-base-100/40 p-10 text-center">
            <h2 className="text-lg font-semibold">Sin resultados</h2>
            <p className="mt-2 text-sm text-base-content/70">
              No encontramos libros para la categoría seleccionada.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {filteredBooks.map((book) => (
              <li key={`${book.category}-${book.id}`}>
                <BookCard
                  book={book}
                  categoryLabel={CATEGORY_LABEL[book.category]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function FilterBar({ activeCategory, onChange, query, onQueryChange }) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <label className="input input-bordered flex items-center gap-2 w-full md:max-w-md bg-base-100">
        <Search className="w-4 h-4 opacity-70" />
        <input
          type="text"
          className="grow"
          placeholder="Buscar por título, autor o descripción..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Buscar en catálogo de literatura"
        />
      </label>

      <div className="join">
        {CATEGORY_OPTIONS.map((option) => {
          const isActive = option.id === activeCategory;
          return (
            <button
              key={option.id}
              type="button"
              className={`btn btn-sm join-item ${
                isActive ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => onChange(option.id)}
              aria-pressed={isActive}
            >
              <span className="mr-2 hidden sm:inline-flex">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}



function BookCard({ book, categoryLabel }) {
  const { title, autor, description, imagen, link } = book || {};
  const isValidUrl = typeof link === "string" && /^https?:\/\//i.test(link);
  const [expanded, setExpanded] = useState(false);

  const normalizedDescription = (description ?? "").trim();
  const THRESHOLD = 140;
  const COLLAPSED_LINES = 3;
  const LINE_HEIGHT_REM = 1.5;
  const collapsedDescriptionHeight = `${(
    COLLAPSED_LINES * LINE_HEIGHT_REM
  ).toFixed(2)}rem`;
  const needsToggle = useMemo(() => {
    return normalizedDescription.length > THRESHOLD;
  }, [normalizedDescription]);
  const shortText = useMemo(() => {
    return normalizedDescription.slice(0, THRESHOLD).trimEnd();
  }, [normalizedDescription]);
  const cardClassName = [
    "card bg-base-100 border border-base-300/70 hover:border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden",
    expanded ? "" : "min-h-[22rem]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      <figure className="relative h-44 sm:h-56 bg-base-300 grid place-items-center p-2 sm:p-3">
        {imagen ? (
          <img
            src={imagen}
            alt={title ? `Portada: ${title}` : "Portada del libro"}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="text-sm text-base-content/60">
            Imagen no disponible
          </span>
        )}
      </figure>

      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg sm:text-xl leading-tight">
            {title || "Título no disponible"}
          </h3>

          {categoryLabel && (
            <span className="badge badge-primary badge-outline whitespace-nowrap">
              {categoryLabel}
            </span>
          )}
        </div>

        {autor && (
          <p className="mt-1 text-sm font-medium text-base-content/70">
            {autor}
          </p>
        )}

        {normalizedDescription && (
          <div className="mt-1 text-sm sm:text-[0.95rem] text-base-content/80">
            <p
              className={!expanded ? "line-clamp-3" : ""}
              style={{ minHeight: collapsedDescriptionHeight }}
            >
              {expanded
                ? normalizedDescription
                : needsToggle
                ? `${shortText}...`
                : normalizedDescription}
            </p>

            {needsToggle && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-2 btn btn-link btn-xs p-0 h-auto min-h-0 no-underline text-secondary"
                aria-expanded={expanded}
              >
                {expanded ? "Ver menos" : "Ver mas"}
              </button>
            )}
          </div>
        )}

        <div className="card-actions mt-4">
          {isValidUrl ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm normal-case"
            >
              Ver libro
            </a>
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
