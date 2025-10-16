import { getServiceProducts, getEvents } from "./auth.js";

const norm = (v) => (typeof v === "string" ? v.toLowerCase().trim() : "");
const includesQ = (q, ...fields) => {
  const nq = norm(q);
  if (!nq) return false;
  return fields.some((f) => {
    if (Array.isArray(f)) return f.some((x) => norm(x).includes(nq));
    return norm(f).includes(nq);
  });
};

export async function searchAll(query) {
  const q = String(query || "").trim();
  if (!q) return { products: [], events: [], pages: [] };

  try {
    // Catálogo de páginas estáticas navegables
    const staticPages = [
      { title: "Inicio", path: "/", keywords: ["home", "inicio", "astromania", "astromanía"] },
      { title: "Nosotros", path: "/nosotros", keywords: ["nosotros", "quienes somos", "about", "misión", "vision", "visión", "mision"] },
      { title: "Servicios y Productos", path: "/servicios-productos-list", keywords: ["servicios", "productos", "tienda", "catalogo", "catalogue", "actividades", "recursos"] },
      { title: "Recursos", path: "/recursos", keywords: ["recursos", "material", "contenido", "artículos", "articulos", "blog"] },
      { title: "Comunidad", path: "/comunidad", keywords: ["comunidad", "foro", "charlas", "talleres", "participa"] },
      { title: "Contacto", path: "/contacto", keywords: ["contacto", "email", "soporte", "mensaje"] },
      { title: "Eventos", path: "/eventos", keywords: ["eventos", "calendario", "agenda"] },
      
      { title: "Astromanía Responde", path: "/comunidad", keywords: ["astromania responde", "astromanía responde", "preguntas", "faq", "respuestas"] },
    ];

    const [spRes, evRes] = await Promise.allSettled([
      getServiceProducts(),
      getEvents(),
    ]);

    const spAll = spRes.status === "fulfilled" ? spRes.value.data ?? [] : [];
    const evAll = evRes.status === "fulfilled" ? evRes.value.data ?? [] : [];

    const products = (Array.isArray(spAll) ? spAll : []).filter((p) =>
      includesQ(q, p.title, p.shortDescription, p.description, p.category, p.type, p.tags, p.location, p.locations)
    );

    const events = (Array.isArray(evAll) ? evAll : []).filter((e) =>
      includesQ(q, e.title, e.description, e.organizer, e.location, e.tags)
    );

    const pages = staticPages.filter((pg) => includesQ(q, pg.title, pg.keywords));

    return { products, events, pages };
  } catch (err) {
    console.error("searchAll error", err);
    return { products: [], events: [], pages: [] };
  }
}



