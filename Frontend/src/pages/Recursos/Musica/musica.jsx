// src/pages/MusicaAstronomica.jsx
import { useMemo, useState } from "react";
import { Search, Music2, Sparkles, Radio } from "lucide-react";
import { MUSIC_ITEMS } from "../../../data/music_items.jsx";
import { filterByCategoryAndQuery } from "../../../utils/filters.js";

const TYPE_OPTIONS = [
  { value: "all", label: "Todo", icon: <Music2 className="w-4 h-4" /> },
  { value: "album", label: "Álbumes", icon: <Sparkles className="w-4 h-4" /> },

  { value: "episode", label: "Podcast", icon: <Radio className="w-4 h-4" /> },
];

export default function MusicaAstronomica() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [active, setActive] = useState(null);

  const filtered = useMemo(
    () =>
      filterByCategoryAndQuery(MUSIC_ITEMS, type, query, {
        categorySelector: (item) => item?.type,
        fieldSelector: (item) => [
          item?.title,
          item?.desc,
          ...(item?.tags || []),
        ],
      }),
    [query, type]
  );

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <header className="max-w-3xl mt-15">
          <h1 className="text-3xl lg:text-4xl ">Música astronómica</h1>
          <p className="mt-2 text-base text-base-content/80">
            En Fundación Astromanía creemos que la música inspira el
            aprendizaje: nuestros discos y selecciones (playlists, álbumes y
            podcasts) fusionan arte y ciencia para acercar la astronomía y su
            historia, y acompañar tus observaciones, estudio o viajes sonoros
            por el universo.
          </p>
        </header>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <label className="input input-bordered flex items-center gap-2 w-full md:max-w-md bg-base-100">
            <Search className="w-4 h-4 opacity-70" />
            <input
              type="text"
              className="grow"
              placeholder="Buscar por título, tag, descripción…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar música astronómica"
            />
          </label>

          <div className="join">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`btn btn-sm join-item ${type === opt.value ? "btn-primary" : "btn-outline"
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
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filtered.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <SpotifyCard item={item} onOpen={setActive} />
            </li>
          ))}
        </ul>

        {/* Modal (embed) */}
        <SpotifyModal active={active} onClose={() => setActive(null)} />
      </section>
    </main>
  );
}

/* ---------- Card ---------- */

function SpotifyCard({ item, onOpen }) {
  const { title, desc = "", cover, tags, type } = item;
  const [expanded, setExpanded] = useState(false);

  // umbral simple por caracteres; ajusta si quieres
  const THRESHOLD = 140;
  const needsToggle = useMemo(() => desc.trim().length > THRESHOLD, [desc]);
  const shortText = useMemo(() => desc.trim().slice(0, THRESHOLD), [desc]);

  return (
    <article className="card bg-base-100 border border-base-300/70 hover:border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      {/* Header cuadrado */}
      <figure className="relative aspect-square bg-base-300/70 grid place-items-center p-4 sm:p-5">
        <img
          src={cover}
          alt=""
          className="max-w-full max-h-full object-contain drop-shadow-sm"
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </figure>

      <div className="card-body">
        <div className="flex items-center justify-between gap-3">
          <h3 className="card-title text-lg sm:text-xl leading-tight">
            {title}
          </h3>
          <span className="badge badge-ghost capitalize">{type}</span>
        </div>

        {/* Descripción con toggle */}
        {desc && (
          <div className="mt-1 text-sm text-base-content/80">
            <p className={!expanded ? "line-clamp-3" : ""}>
              {expanded ? desc : needsToggle ? `${shortText}…` : desc}
            </p>

            {needsToggle && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 btn btn-link btn-xs p-0 h-auto min-h-0 no-underline text-secondary"
                aria-expanded={expanded}
                aria-label={
                  expanded ? "Ver menos descripción" : "Ver más descripción"
                }
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        )}

        {!!(tags && tags.length) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="badge badge-outline">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions mt-4">
          <button
            className="btn btn-primary btn-sm normal-case"
            onClick={() => onOpen(item)}
            aria-label={`Reproducir ${title}`}
          >
            Reproducir
          </button>

          <a
            href={toPublicSpotifyUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm normal-case"
            aria-label={`Abrir ${title} en Spotify`}
            title="Abrir en Spotify"
          >
            Abrir en Spotify
          </a>
        </div>
      </div>
    </article>
  );
}

/* ---------- Modal con Embed ---------- */
function SpotifyModal({ active, onClose }) {
  if (!active) return null;
  const src = toEmbedSrc(active);

  const isPodcast = active.type === "show" || active.type === "episode";
  const wrapperClass = isPodcast ? "h-[352px]" : "aspect-video";

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl w-full bg-neutral text-neutral-content">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">{active.title}</h3>
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </form>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl bg-black">
          <div className={wrapperClass}>
            <iframe
              title={active.title}
              src={src}
              width="100%"
              height="100%"
              className="w-full h-full rounded-2xl block"
              style={{ border: "none" }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        <div className="modal-action">
          <a
            href={toPublicSpotifyUrl(active)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm normal-case"
          >
            Abrir en Spotify
          </a>
          <form method="dialog">
            <button
              className="btn btn-ghost btn-sm normal-case"
              onClick={onClose}
            >
              Cerrar
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
}

/* ---------- Helpers ---------- */
const {
  VITE_SPOTIFY_EMBED_BASE,
  VITE_SPOTIFY_PUBLIC_BASE,
  VITE_SPOTIFY_EMBED_THEME = "0",
} = import.meta.env;

const buildEmbedUrl = (type, id) =>
  `${VITE_SPOTIFY_EMBED_BASE}/${type}/${id}?utm_source=generator&theme=${VITE_SPOTIFY_EMBED_THEME}`;

const buildPublicUrl = (type, id) => `${VITE_SPOTIFY_PUBLIC_BASE}/${type}/${id}`;

function toEmbedSrc({ id, type }) {
  return buildEmbedUrl(type, id);
}

function toPublicSpotifyUrl({ id, type }) {
  return buildPublicUrl(type, id);
}
