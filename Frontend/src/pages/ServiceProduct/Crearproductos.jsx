import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";
import { BackButton } from "../../components/Common/BackButton.jsx";

const baseInput =
  "w-full input input-bordered input-sm rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";
const baseTextarea =
  "textarea textarea-bordered textarea-sm rounded-lg min-h-28 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";

const TYPE_OPTIONS = [
  { value: "product", label: "Producto" },
  { value: "service", label: "Servicio" },
  { value: "activity", label: "Actividad" },
];

const TYPE_LABEL = {
  product: "producto",
  service: "servicio",
  activity: "actividad",
};

const LINK_TEMPLATE = { label: "", url: "" };

const BASE_FORM = {
  title: "",
  category: "",
  shortDescription: "",
  description: "",
  location: "",
  price: "",
  tags: "",
  active: true,
  stock: "",
  delivery: "",
  durationMinutes: "",
  capacity: "",
  locations: "",
};

function Section({ title, subtitle, children }) {
  return (
    <section className="card bg-base-100/70 border border-base-200 shadow-sm">
      <div className="card-body p-5 space-y-5">
        <header>
          <h2 className="text-lg font-semibold tracking-tight text-primary">{title}</h2>
          {subtitle ? <p className="text-xs opacity-70 mt-1 max-w-2xl">{subtitle}</p> : null}
          <div className="mt-3 h-1 w-12 rounded-full bg-primary/30" />
        </header>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}

function Row({ label, htmlFor, children }) {
  return (
    <div className="md:relative">
      <label htmlFor={htmlFor} className="label md:absolute md:left-0 md:top-1 md:w-52 pb-0">
        <span className="label-text text-sm font-medium opacity-90">{label}</span>
      </label>
      <div className="md:ml-52">{children}</div>
    </div>
  );
}

export function CrearProductos() {
  const location = useLocation();
  const presetType = location?.state?.presetType;
  const initialType = TYPE_OPTIONS.some((opt) => opt.value === presetType) ? presetType : "product";

  const { createSP } = useServiceProducts();

  const [form, setForm] = useState({ ...BASE_FORM, type: initialType });
  const [links, setLinks] = useState(initialType === "activity" ? [LINK_TEMPLATE] : []);
  const [files, setFiles] = useState([]); // File[]
  const [alts, setAlts] = useState([]); // string[]
  const [preview, setPreview] = useState([]); // { url, name }[]
  const [loading, setLoading] = useState(false);

  const isProduct = form.type === "product";
  const isService = form.type === "service";
  const isActivity = form.type === "activity";
  const submitLabel = `Crear ${TYPE_LABEL[form.type]}`;

  const activeLinks = useMemo(
    () => links.filter((link) => link.url.trim() || link.label.trim()),
    [links]
  );

  const updateForm = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => {
      if (prev.type === type) return prev;
      const next = { ...prev, type };
      if (type === "product") {
        return {
          ...next,
          durationMinutes: "",
          capacity: "",
          locations: "",
          location: "",
        };
      }
      if (type === "service") {
        return {
          ...next,
          stock: "",
          delivery: "",
          location: "",
        };
      }
      if (type === "activity") {
        return {
          ...next,
          price: "",
          stock: "",
          delivery: "",
          durationMinutes: "",
          capacity: "",
          locations: "",
        };
      }
      return next;
    });
    setLinks((prev) => (type === "activity" ? prev.length ? prev : [LINK_TEMPLATE] : []));
  };

  const updateLink = (index, field, value) => {
    setLinks((prev) =>
      prev.map((link, idx) => (idx === index ? { ...link, [field]: value } : link))
    );
  };

  const addLink = () => setLinks((prev) => [...prev, LINK_TEMPLATE]);
  const removeLink = (index) =>
    setLinks((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [LINK_TEMPLATE];
    });

  const onPickFiles = (event) => {
    const picked = Array.from(event.target.files || []);
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
    setAlts((prev) => [...prev, ...Array(picked.length).fill("")]);
    const previews = picked.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreview((prev) => [...prev, ...previews]);
  };

  const onChangeAlt = (index, value) =>
    setAlts((prev) => prev.map((alt, idx) => (idx === index ? value : alt)));

  const removeImage = (index) => {
    const item = preview[index];
    if (item) URL.revokeObjectURL(item.url);
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setAlts((prev) => prev.filter((_, idx) => idx !== index));
    setPreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  useEffect(
    () => () => {
      preview.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [preview]
  );

  const resetForm = () => {
    preview.forEach((item) => URL.revokeObjectURL(item.url));
    const nextType = initialType;
    setForm({ ...BASE_FORM, type: nextType });
    setLinks(nextType === "activity" ? [LINK_TEMPLATE] : []);
    setFiles([]);
    setAlts([]);
    setPreview([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      window?.toast?.error?.("El título es obligatorio") ?? alert("El título es obligatorio");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("type", form.type);
      fd.append("active", String(!!form.active));

      if (form.category.trim()) fd.append("category", form.category.trim());
      if (form.shortDescription.trim()) fd.append("shortDescription", form.shortDescription.trim());
      if (form.description.trim()) fd.append("description", form.description.trim());

      if (!isActivity && form.price !== "") {
        fd.append("price", String(form.price));
      }

      if (isProduct) {
        if (form.stock !== "") fd.append("stock", String(form.stock));
        if (form.delivery.trim()) fd.append("delivery", form.delivery.trim());
      }

      if (isService) {
        if (form.durationMinutes !== "") fd.append("durationMinutes", String(form.durationMinutes));
        if (form.capacity !== "") fd.append("capacity", String(form.capacity));
        const locs = form.locations
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        fd.append("locations", JSON.stringify(locs));
      } else {
        fd.append("locations", JSON.stringify([]));
      }

      if (isActivity) {
        if (form.location.trim()) fd.append("location", form.location.trim());
        const linksPayload = links
          .map((link) => ({
            label: link.label.trim(),
            url: link.url.trim(),
          }))
          .filter((link) => link.url);
        fd.append("links", JSON.stringify(linksPayload));
      } else {
        fd.append("location", "");
        fd.append("links", JSON.stringify([]));
      }

      const tagsArray = form.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
      fd.append("tags", JSON.stringify(tagsArray));

      fd.append("alts", JSON.stringify(alts));
      files.forEach((file) => fd.append("images", file));

      await createSP(fd);

      window?.toast?.success?.("Elemento creado correctamente") ?? alert("Elemento creado correctamente");
      resetForm();
    } catch (error) {
      console.error("Crear elemento catálogo error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo crear el elemento";
      window?.toast?.error?.(msg) ?? alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mt-15 max-w-4xl mx-auto px-4 pb-28 pt-6">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-white bg-clip-text text-transparent">
            Crear elemento en el catálogo
          </span>
        </h1>
        <BackButton fallback="/admin/eventos/editar" />
        
      </header>

      <div className="flex flex-wrap gap-2">
        
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn btn-sm ${form.type === option.value ? "btn-primary" : "btn-outline"}`}
            onClick={() => handleTypeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
        
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Información básica" subtitle="Título, categoría y contenido principal del recurso.">
          <Row label="Título" htmlFor="title">
            <input
              id="title"
              name="title"
              className={baseInput}
              value={form.title}
              onChange={updateForm}
              placeholder="Ej: Taller de observación"
              required
            />
          </Row>

          <Row label="Categoría" htmlFor="category">
            <input
              id="category"
              name="category"
              className={baseInput}
              value={form.category}
              onChange={updateForm}
              placeholder="Ej: Taller, Producto, Jornada"
            />
          </Row>

          {!isActivity && (
            <Row label="Precio (CLP)" htmlFor="price">
              <input
                id="price"
                name="price"
                className={baseInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={form.price}
                onChange={updateForm}
                placeholder={isProduct ? "0" : "Opcional"}
                required={isProduct}
              />
            </Row>
          )}

          <Row label="Resumen" htmlFor="shortDescription">
            <textarea
              id="shortDescription"
              name="shortDescription"
              className={baseTextarea}
              value={form.shortDescription}
              onChange={updateForm}
              placeholder="Descripción breve que se mostrará en tarjetas y listados."
            />
          </Row>

          <Row label="Descripción" htmlFor="description">
            <textarea
              id="description"
              name="description"
              className={baseTextarea}
              value={form.description}
              onChange={updateForm}
              placeholder="Incluye todos los detalles: objetivos, material, dinámica, requisitos, etc."
            />
          </Row>

          {isActivity && (
            <Row label="Ubicación" htmlFor="location">
              <input
                id="location"
                name="location"
                className={baseInput}
                value={form.location}
                onChange={updateForm}
                placeholder="Ej: Planetario, Online, Región Metropolitana"
              />
            </Row>
          )}

          <Row label="Estado">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-primary"
                checked={form.active}
                onChange={updateForm}
                name="active"
              />
              <span className="label-text text-sm">Visible en el catálogo</span>
            </label>
          </Row>
        </Section>

        {isProduct && (
          <Section title="Detalles de producto" subtitle="Gestiona stock y formato de entrega.">
            <Row label="Stock" htmlFor="stock">
              <input
                id="stock"
                name="stock"
                className={baseInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={form.stock}
                onChange={updateForm}
                placeholder="0"
              />
            </Row>
            <Row label="Entrega / Formato" htmlFor="delivery">
              <input
                id="delivery"
                name="delivery"
                className={baseInput}
                value={form.delivery}
                onChange={updateForm}
                placeholder="Ej: Retiro en tienda, Envío nacional, Digital"
              />
            </Row>
          </Section>
        )}

        {isService && (
          <Section title="Detalles de servicio" subtitle="Incluye duración, aforo y ubicaciones">
            <Row label="Duración (min)" htmlFor="durationMinutes">
              <input
                id="durationMinutes"
                name="durationMinutes"
                className={baseInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={form.durationMinutes}
                onChange={updateForm}
              />
            </Row>
            <Row label="Capacidad" htmlFor="capacity">
              <input
                id="capacity"
                name="capacity"
                className={baseInput}
                type="number"
                min="0"
                inputMode="numeric"
                value={form.capacity}
                onChange={updateForm}
              />
            </Row>
            <Row label="Ubicaciones" htmlFor="locations">
              <input
                id="locations"
                name="locations"
                className={baseInput}
                value={form.locations}
                onChange={updateForm}
                placeholder="Ej: Santiago, Valparaíso"
              />
              <p className="text-xs opacity-60 mt-1">Separa múltiples ubicaciones con coma.</p>
            </Row>
          </Section>
        )}

        <Section title="Etiquetas y enlaces" subtitle="Facilitan la búsqueda y añaden material adicional.">
          <Row label="Etiquetas" htmlFor="tags">
            <input
              id="tags"
              name="tags"
              className={baseInput}
              value={form.tags}
              onChange={updateForm}
              placeholder="astro, divulgación, familiar"
            />
          </Row>

          {isActivity && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-base-content/80">Enlaces útiles</p>
              {links.map((link, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_minmax(0,1fr)_auto]">
                  <input
                    className={baseInput}
                    placeholder="Etiqueta (opcional)"
                    value={link.label}
                    onChange={(e) => updateLink(index, "label", e.target.value)}
                  />
                  <input
                    className={baseInput}
                    placeholder="https://"
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                    required={activeLinks.length === 0}
                  />
                  <div className="flex items-center justify-end gap-2">
                    {links.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeLink(index)}>
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addLink}>
                + Añadir enlace
              </button>
            </div>
          )}
        </Section>

        <Section title="Material visual" subtitle="Imágenes opcionales para tarjetas y detalle.">
          <Row label="Subir">
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="filepicker"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onPickFiles}
              />
              <label htmlFor="filepicker" className="btn btn-accent btn-sm md:btn-md">
                Seleccionar imágenes
              </label>
              <span className="text-xs opacity-70">Formatos JPG o PNG hasta 5MB.</span>
            </div>
          </Row>

          {preview.length > 0 ? (
            <Row label="Vista previa">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {preview.map((item, index) => (
                  <div key={item.url} className="card bg-base-200/70 border border-base-300 shadow-sm">
                    <figure className="aspect-square overflow-hidden">
                      <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
                    </figure>
                    <div className="card-body p-3 gap-2">
                      <input
                        className="input input-bordered input-sm"
                        placeholder="Texto alternativo"
                        value={alts[index] || ""}
                        onChange={(e) => onChangeAlt(index, e.target.value)}
                      />
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => removeImage(index)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          ) : (
            <Row label="Vista previa">
              <div className="rounded-xl border-2 border-dashed border-base-300 p-6 text-center text-base-content/70">
                Aún no has seleccionado imágenes.
              </div>
            </Row>
          )}
        </Section>

        <div className="btm-nav md:static md:btm-nav-none md:flex md:justify-end md:gap-3">
          <button type="submit" className={`btn btn-primary btn-sm md:btn-md ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Creando..." : submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
