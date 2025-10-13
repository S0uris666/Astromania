
import { useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";

/* ---------- UI helpers minimal (mismos estilos que eventos) ---------- */
const baseInput =
  "w-full input input-bordered input-sm rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";
const baseSelect =
  "select select-bordered select-sm rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";
const baseTextarea =
  "textarea textarea-bordered textarea-sm rounded-lg min-h-28 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";

function SectionTitle({ icon = "★", title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold tracking-tight">
          <span className="bg-secondary bg-clip-text text-transparent">{title}</span>
        </h2>
        {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
        <div className="h-1 w-16 rounded-full bg-primary/30 mt-3" />
      </div>
    </div>
  );
}

function Row({ label, children, htmlFor }) {
  return (
    <div className="md:relative">
      <label
        htmlFor={htmlFor}
        className="label md:absolute md:left-0 md:top-1 md:w-56 pb-0"
      >
        <span className="label-text text-sm font-medium opacity-90">{label}</span>
      </label>
      <div className="md:ml-56">{children}</div>
    </div>
  );
}

function Field({ id, label, hint, ...inputProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control gap-1.5">
        <input id={id} className={baseInput} {...inputProps} />
        {hint ? <span className="text-xs opacity-60">{hint}</span> : null}
      </div>
    </Row>
  );
}

function FieldArea({ id, label, hint, ...areaProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control gap-1.5">
        <textarea id={id} className={baseTextarea} {...areaProps} />
        {hint ? <span className="text-xs opacity-60">{hint}</span> : null}
      </div>
    </Row>
  );
}

function FieldSelect({ id, label, children, ...selectProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control">
        <select id={id} className={baseSelect} {...selectProps}>
          {children}
        </select>
      </div>
    </Row>
  );
}

function FieldToggle({ label, checked, onChange, textRight = "Activar" }) {
  return (
    <Row label={label}>
      <label className="label cursor-pointer justify-start gap-3">
        <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={checked} onChange={onChange} />
        <span className="label-text text-sm">{textRight}</span>
      </label>
    </Row>
  );
}
/* -------------------------------------------------------------------- */

export function CrearProductos() {
  const location = useLocation();
  const presetType = location?.state?.presetType; // "product" | "service"

  const { createSP } = useServiceProducts();

  const [form, setForm] = useState({
    title: "",
    type: presetType === "service" ? "service" : "product",
    // comunes
    price: "",
    shortDescription: "",
    description: "",
    category: "",
    tags: "",
    active: true,
    // producto
    stock: "",
    delivery: "",
    // servicio
    durationMinutes: "",
    capacity: "",
    locations: "",
  });

  const [files, setFiles] = useState([]);     // File[]
  const [alts, setAlts] = useState([]);       // string[]
  const [preview, setPreview] = useState([]); // { url, name }[]
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const isProduct = useMemo(() => form.type === "product", [form.type]);
  const isService = !isProduct;

  // limpiar campos ajenos al cambiar de tipo
  useEffect(() => {
    setForm((f) => ({
      ...f,
      ...(isProduct
        ? { durationMinutes: "", capacity: "", locations: "" }
        : { stock: "", delivery: "" }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type]);

  const onPickFiles = (e) => {
    const f = Array.from(e.target.files || []);
    if (!f.length) return;
    const merged = [...files, ...f];
    setFiles(merged);
    setAlts((a) => [...a, ...Array(f.length).fill("")]);

    const pv = f.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreview((p) => [...p, ...pv]);
  };

  const onChangeAlt = (idx, value) =>
    setAlts((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const removeImage = (idx) => {
    const item = preview[idx];
    if (item) URL.revokeObjectURL(item.url);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setAlts((prev) => prev.filter((_, i) => i !== idx));
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  // revoke todas las URLs al desmontar o limpiar
  useEffect(() => {
    return () => {
      preview.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [preview]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();

      // básicos
      fd.append("title", form.title);
      fd.append("type", form.type);
      if (form.price !== "") fd.append("price", String(form.price));
      if (form.shortDescription) fd.append("shortDescription", form.shortDescription);
      if (form.description) fd.append("description", form.description);
      if (form.category) fd.append("category", form.category);
      fd.append("active", String(!!form.active));

      // producto
      if (isProduct) {
        if (form.stock !== "") fd.append("stock", String(form.stock));
        if (form.delivery) fd.append("delivery", form.delivery);
      }

      // servicio
      if (isService) {
        if (form.durationMinutes !== "") fd.append("durationMinutes", String(form.durationMinutes));
        if (form.capacity !== "") fd.append("capacity", String(form.capacity));
        const locs = form.locations
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        fd.append("locations", JSON.stringify(locs));
      }

      // tags
      const tagsArr = form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      fd.append("tags", JSON.stringify(tagsArr));

      // alts por imagen (opcional)
      fd.append("alts", JSON.stringify(alts));

      // archivos
      files.forEach((f) => fd.append("images", f));

      // crear
      await createSP(fd);

      if (window?.toast?.success) window.toast.success("Creado con éxito ✅");
      else alert("Creado con éxito ✅");

      // limpiar
      preview.forEach((p) => URL.revokeObjectURL(p.url));
      setForm({
        title: "",
        type: presetType === "service" ? "service" : "product",
        price: "",
        shortDescription: "",
        description: "",
        category: "",
        tags: "",
        active: true,
        stock: "",
        delivery: "",
        durationMinutes: "",
        capacity: "",
        locations: "",
      });
      setFiles([]);
      setAlts([]);
      setPreview([]);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al crear";
      if (window?.toast?.error) window.toast.error(msg);
      else alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-28 pt-6">
      <header className="mb-6 mt-15 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-white bg-clip-text text-transparent">
            Nuevo {isProduct ? "producto" : "servicio"}
          </span>
        </h1>

        <div className="sm:ml-auto">
          <div className="join">
            <button
              type="button"
              className={`btn btn-sm join-item ${isProduct ? "btn-primary" : "btn-outline"}`}
              onClick={() => setForm((f) => ({ ...f, type: "product" }))}
            >
              Producto
            </button>
            <button
              type="button"
              className={`btn btn-sm join-item ${isService ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setForm((f) => ({ ...f, type: "service" }))}
            >
              Servicio
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-6">
        {/* Básicos */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="📦" title="Información básica" subtitle="Datos comunes para producto o servicio." />
            <div className="space-y-4 ">
              <Field
                id="title"
                label="Título"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Ej: Figura Orión 3D / Taller de observación"
                required
              />
              <Field
                id="category"
                label="Categoría"
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="ej: figuras, talleres"
              />
              <Field
                id="price"
                label="Precio (CLP)"
                name="price"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.price}
                onChange={onChange}
                placeholder={isService ? "Opcional para servicios" : "0"}
              />
              <FieldToggle
                label="Estado"
                checked={form.active}
                onChange={(e) => onChange({ target: { name: "active", type: "checkbox", checked: e.target.checked } })}
                textRight="Activo"
              />
              <Field
                id="shortDescription"
                label="Resumen"
                name="shortDescription"
                value={form.shortDescription}
                onChange={onChange}
                placeholder="Descripción breve visible en tarjetas"
              />
              <FieldArea
                id="description"
                label="Descripción"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Detalles, materiales, dinámica, requisitos, etc."
              />
            </div>
          </div>
        </section>

        {/* Producto */}
        {isProduct && (
          <section className="card bg-base-100/70 border border-base-200 shadow-sm">
            <div className="card-body p-5 space-y-5">
              <SectionTitle icon="🛒" title="Detalles de producto" subtitle="Stock y formato de entrega." />
              <div className="space-y-4">
                <Field
                  id="stock"
                  label="Stock"
                  name="stock"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={form.stock}
                  onChange={onChange}
                  placeholder="0"
                />
                <Field
                  id="delivery"
                  label="Entrega/Formato"
                  name="delivery"
                  value={form.delivery}
                  onChange={onChange}
                  placeholder="physical | digital | onsite"
                  hint="Ejemplos: 'physical', 'digital', 'onsite'."
                />
              </div>
            </div>
          </section>
        )}

        {/* Servicio */}
        {isService && (
          <section className="card bg-base-100/70 border border-base-200 shadow-sm">
            <div className="card-body p-5 space-y-5">
              <SectionTitle icon="🛎️" title="Detalles de servicio" subtitle="Duración, cupos y ubicaciones." />
              <div className="space-y-4">
                <Field
                  id="durationMinutes"
                  label="Duración (min)"
                  name="durationMinutes"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={form.durationMinutes}
                  onChange={onChange}
                />
                <Field
                  id="capacity"
                  label="Capacidad (personas)"
                  name="capacity"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={form.capacity}
                  onChange={onChange}
                />
                <Field
                  id="locations"
                  label="Ubicaciones"
                  name="locations"
                  value={form.locations}
                  onChange={onChange}
                  placeholder="Santiago, Valparaíso"
                  hint="Separa múltiples ubicaciones con coma."
                />
              </div>
            </div>
          </section>
        )}

        {/* Tags */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="🏷️" title="Etiquetas" subtitle="Mejoran la búsqueda y categorización." />
            <div className="space-y-4">
              <Field
                id="tags"
                label="Tags"
                name="tags"
                value={form.tags}
                onChange={onChange}
                placeholder="astro, resina, orion"
                hint="Usa 2–5 tags relevantes (separados por coma)."
              />
            </div>
          </div>
        </section>

        {/* Imágenes */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="🖼️" title="Imágenes" subtitle="Agrega fotos y textos alternativos (accesibilidad)." />

            <Row label="Subida">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="filepick"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onPickFiles}
                  className="hidden"
                />
                <label htmlFor="filepick" className="btn btn-accent btn-sm md:btn-md">
                  📷 Subir imágenes
                </label>
                <span className="text-xs opacity-70">
                  Puedes arrastrar y soltar archivos en esta página.
                </span>
              </div>
            </Row>

            <Row label="Vista previa">
              {preview.length ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {preview.map((p, idx) => (
                    <div key={p.url} className="card bg-base-200/70 border border-base-300 shadow-sm">
                      <figure className="aspect-square overflow-hidden">
                        <img src={p.url} alt={p.name} className="object-cover w-full h-full" />
                      </figure>
                      <div className="card-body p-3 gap-2">
                        <input
                          className="input input-bordered input-sm"
                          placeholder="Alt de la imagen"
                          value={alts[idx] || ""}
                          onChange={(e) => onChangeAlt(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => removeImage(idx)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-base-300 p-6 text-center text-base-content/70">
                  Aún no hay imágenes. Usa “Subir imágenes”.
                </div>
              )}
            </Row>
          </div>
        </section>

        {/* Acciones */}
        <div className="btm-nav md:static md:btm-nav-none md:flex md:justify-end md:gap-3">
          <button
            type="submit"
            className={`btn btn-primary btn-sm md:btn-md ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creando..." : `Crear ${isProduct ? "producto" : "servicio"}`}
          </button>
        </div>
      </form>
    </main>
  );
}
