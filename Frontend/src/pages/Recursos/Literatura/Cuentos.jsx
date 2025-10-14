import { literatura_cuento as libros } from "../../../data/Literatura_cuento.jsx";

export function Cuentos() {
  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200 mt-15">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Encabezado */}
        <header className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl">Libros de cuentos</h1>
          <p className="mt-2 text-base text-base-content/80">
            Selección de títulos para comprender el cosmos paso a paso:
            guías, divulgación y material de referencia.
          </p>
        </header>

        {/* Grid de cards */}
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {libros.map((b) => (
            <li key={b.id}>
              <BookCard libro={b} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/* ---------- Subcomponente: Card ---------- */

function BookCard({ libro }) {
  const { title, autor, descripción, imagen, link } = libro || {};

  // Si no hay URL válida, deshabilita el botón
  const isValidUrl = typeof link === "string" && /^https?:\/\//i.test(link);

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
      {/* Imagen de portada - mostrar COMPLETA */}
      <figure className="relative h-44 sm:h-56 bg-base-300 grid place-items-center p-2 sm:p-3">
        <img
          src={imagen}
          alt={`Portada: ${title}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </figure>

      {/* Contenido */}
      <div className="card-body">
        <h3 className="card-title text-lg sm:text-xl leading-tight">
          {title}
        </h3>
        {autor && <p className="text-sm text-base-content/70">{autor}</p>}
        {descripción && (
          <p className="mt-2 text-sm sm:text-[0.95rem] text-base-content/80 line-clamp-4">
            {descripción}
          </p>
        )}

        <div className="card-actions mt-4">
          {isValidUrl ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm normal-case"
              aria-label={`Abrir ${title} en nueva pestaña`}
              title="Ver libro"
            >
              Ver libro
            </a>
          ) : (
            <button className="btn btn-disabled btn-sm normal-case" title="Enlace no disponible">
              Enlace no disponible
            </button>
          )}
        </div>
      </div>
    </article>
  );
}