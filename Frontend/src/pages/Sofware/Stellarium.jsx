import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, Info, Maximize2, Minimize2, RotateCcw } from "lucide-react";

const STELLARIUM_URL = import.meta.env.VITE_STELLARIUM_URL || "https://stellarium-web.org/";
const TOOLBAR_BUTTON = "btn btn-sm gap-2";
const OUTLINE_BUTTON = `${TOOLBAR_BUTTON} btn-outline`;
const PRIMARY_BUTTON = `${TOOLBAR_BUTTON} btn-primary`;

export function Stellarium() {
  const frameRef = useRef(null);
  const [isFull, setIsFull] = useState(false);
  const [src, setSrc] = useState(STELLARIUM_URL);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const reloadFrame = () => {
    setErrored(false);
    setLoading(true);
    setSrc("");
    requestAnimationFrame(() => setSrc(STELLARIUM_URL));
  };

  const status = useMemo(() => {
    if (errored) {
      return {
        badge: "badge-warning text-warning-content",
        message: "Error al cargar",
        helper: "Intenta recargar el visor o abrirlo en otra pestana.",
      };
    }
    if (loading) {
      return {
        badge: "badge-info text-info-content",
        message: "Cargando planetario",
        helper: "El mapa estelar se prepara...",
      };
    }
    if (isFull) {
      return {
        badge: "badge-primary text-primary-content",
        message: "Pantalla completa",
        helper: "Pulsa Esc para salir rapidamente.",
      };
    }
    return {
      badge: "badge-success text-success-content",
      message: "Listo",
      helper: "Interactua con Stellarium en esta ventana.",
    };
  }, [errored, isFull, loading]);

  useEffect(() => {
    if (!isFull) {
      document.body.style.removeProperty("overflow");
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFull]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && isFull) {
        setIsFull(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFull]);

  const toggleFullscreen = () => setIsFull((value) => !value);
  const containerClass = [
    "relative rounded-2xl overflow-hidden bg-gradient-to-br from-base-300 via-base-200 to-base-100",
    "shadow-xl border border-base-300/60 transition-all",
    isFull ? "fixed inset-0 z-[70] m-0 rounded-none border-0 shadow-none" : "min-h-[24rem]",
  ].join(" ");
  const frameWrapperClass = isFull ? "w-full h-full" : "aspect-video";
  const showOverlayControls = !isFull;

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2 mt-15 ">
            <h1 className="text-3xl lg:text-4xl font-bold">Planetario interactivo</h1>
            <p className="text-base text-base-content/80 max-w-2xl">
              Explora el cielo en tiempo real con Stellarium Web. Arrastra para mover la vista, usa el scroll para
              acercar o alejar y toca cada objeto para ver informacion en detalle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <button
              type="button"
              className={OUTLINE_BUTTON}
              onClick={reloadFrame}
              title="Reiniciar visor"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>

            <a
              href={STELLARIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={OUTLINE_BUTTON}
              title="Abrir en una pestana nueva"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Abrir en pestana</span>
            </a>

            <button
              type="button"
              className={PRIMARY_BUTTON}
              onClick={toggleFullscreen}
              title={isFull ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isFull ? "Salir" : "Pantalla completa"}</span>
            </button>
          </div>
        </header>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-base-content/70">
          <span className={`badge badge-sm ${status.badge}`}>{status.message}</span>
          <span>{status.helper}</span>
        </div>

        <div className="mt-8 space-y-6">
          <div className={containerClass}>
            {loading && !errored && (
              <div className="absolute inset-0 z-30 grid place-items-center bg-neutral/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-sm text-neutral-content">
                  <span className="loading loading-spinner loading-lg" />
                  <span>Preparando el cielo nocturno...</span>
                </div>
              </div>
            )}

            {showOverlayControls && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-xl border border-base-300/70 bg-base-100/80 px-2 py-1 shadow-sm">
                <IconToggle onClick={reloadFrame} title="Reiniciar visor">
                  <RotateCcw className="w-4 h-4" />
                </IconToggle>
                <IconLink href={STELLARIUM_URL} title="Abrir en pestana">
                  <ExternalLink className="w-4 h-4" />
                </IconLink>
                <IconToggle onClick={toggleFullscreen} title="Pantalla completa">
                  <Maximize2 className="w-4 h-4" />
                </IconToggle>
              </div>
            )}

            <div className={frameWrapperClass}>
              {!errored && src && (
                <iframe
                  ref={frameRef}
                  title="Stellarium Web - Mapa estelar"
                  src={src}
                  className="h-full w-full"
                  allow="fullscreen"
                  allowFullScreen
                  loading="lazy"
                  style={{ border: 0, display: "block" }}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setErrored(true);
                  }}
                />
              )}

              {errored && (
                <div className="grid h-full w-full place-items-center bg-base-100 p-6 text-center">
                  <div className="max-w-md space-y-4">
                    <div className="flex justify-center">
                      <AlertTriangle className="h-8 w-8 text-warning" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">No pudimos cargar el planetario</h3>
                      <p className="text-sm text-base-content/70">
                        Revisa tu conexion o abre Stellarium en otra pestana del navegador.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button type="button" className={PRIMARY_BUTTON} onClick={reloadFrame}>
                        Reintentar
                      </button>
                      <a
                        href={STELLARIUM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={OUTLINE_BUTTON}
                      >
                        Abrir en pestana
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isFull && (
              <div className="absolute top-4 right-4 z-40">
                <button
                  type="button"
                  className="btn btn-circle btn-sm bg-white/20 text-white hover:bg-white/30 border-white/30"
                  onClick={() => setIsFull(false)}
                  aria-label="Salir de pantalla completa"
                  title="Salir de pantalla completa"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-base-content/80">
                <p>
                  <strong>Navegacion:</strong> arrastra para mover el cielo y usa el scroll o pellizca para acercar o alejar.
                </p>
                <p>
                  <strong>Detalles:</strong> toca estrellas, planetas u objetos para abrir su ficha descriptiva.
                </p>
                <p>
                  <strong>Consejo:</strong> presiona <kbd className="kbd kbd-xs">Esc</kbd> para salir de pantalla completa al instante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function IconToggle({ children, title, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="btn btn-ghost btn-xs"
    >
      {children}
    </button>
  );
}

function IconLink({ children, title, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className="btn btn-ghost btn-xs"
    >
      {children}
    </a>
  );
}
