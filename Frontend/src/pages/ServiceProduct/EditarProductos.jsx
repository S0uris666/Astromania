
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";

/* ---------- UI helpers (coherentes con las otras pantallas) ---------- */
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
      <label htmlFor={htmlFor} className="label md:absolute md:left-0 md:top-1 md:w-56 pb-0">
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

export function EditarProductos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { serviceProduct, getSP, updateSP, deleteOneServiceProduct } = useServiceProducts();

  // Buscar en store
  const current = useMemo(() => {
    const list = Array.isArray(serviceProduct) ? serviceProduct : [];
    return list.find((x) => (x._id || x.id) === id) || null;
  }, [serviceProduct, id]);

  // Form local
  const [form, setForm] = useState({
    title: "",
    type: "product",
    price: "",
    shortDescription: "",
    description: "",
    category: "",
    tags: "",
    active: true,
    // product
    stock: "",
    delivery: "",
    // service
    durationMinutes: "",
    capacity: "",
    locations: "",
  });

  // Imágenes actuales (backend) y selección de borrado
  const [existingImages, setExistingImages] = useState([]); // [{url, public_id, alt}]
  const [toRemove, setToRemove] = useState({});             // { public_id: true }

  // Nuevas imágenes
  const [files, setFiles] = useState([]);     // File[]
  const [alts, setAlts] = useState([]);       // string[]
  const [preview, setPreview] = useState([]); // [{url, name}]

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isProduct = useMemo(() => form.type === "product", [form.type]);
  const isService = !isProduct;

  // Si no está en memoria, cargar lista
  useEffect(() => {
    if (!current) getSP().catch(() => {});
  }, [current, getSP]);

  // Hidratar formulario cuando llega current
  useEffect(() => {
    if (!current) return;

    const tagsStr = Array.isArray(current.tags) ? current.tags.join(", ") : (current.tags || "");
    const locationsStr = Array.isArray(current.locations) ? current.locations.join(", ") : (current.locations || "");

    const imgs = Array.isArray(current.images) ? current.images : [];
    setExistingImages(imgs);
    setToRemove({});

    setForm({
      title: current.title || "",
      type: current.type || "product",
      price: Number.isFinite(current.price) ? String(current.price) : "",
      shortDescription: current.shortDescription || "",
      description: current.description || "",
      category: current.category || "",
      tags: tagsStr,
      active: current.active !== false,
      stock: Number.isFinite(current.stock) ? String(current.stock) : "",
      delivery: current.delivery || "",
      durationMinutes: Number.isFinite(current.durationMinutes) ? String(current.durationMinutes) : "",
      capacity: Number.isFinite(current.capacity) ? String(current.capacity) : "",
      locations: locationsStr,
    });

    // limpiar nuevas imágenes
    preview.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setAlts([]);
    setPreview([]);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleRemove = (publicId) => {
    setToRemove((p) => ({ ...p, [publicId]: !p[publicId] }));
  };

  const onPickFiles = (e) => {
    const f = Array.from(e.target.files || []);
    if (!f.length) return;
    setFiles((prev) => [...prev, ...f]);
    setAlts((a) => [...a, ...Array(f.length).fill("")]);
    const pv = f.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreview((p) => [...p, ...pv]);
  };

  const onChangeAlt = (idx, value) =>
    setAlts((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const removeNewImage = (idx) => {
    const item = preview[idx];
    if (item) URL.revokeObjectURL(item.url);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setAlts((prev) => prev.filter((_, i) => i !== idx));
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  // revoke todas las URLs al desmontar
  useEffect(() => {
    return () => {
      preview.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [preview]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!current) return;

    try {
      setSaving(true);

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
        const locs = form.locations.split(",").map((t) => t.trim()).filter(Boolean);
        fd.append("locations", JSON.stringify(locs));
      }

      // tags
      const tagsArr = form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      fd.append("tags", JSON.stringify(tagsArr));

      // nuevas imágenes + alts
      files.forEach((f) => fd.append("images", f));
      fd.append("alts", JSON.stringify(alts));

      // imágenes a eliminar
      const removeIds = Object.entries(toRemove).filter(([, v]) => !!v).map(([k]) => k);
      if (removeIds.length) fd.append("removePublicIds", JSON.stringify(removeIds));

      await updateSP(current._id || current.id, fd);

      if (window?.toast?.success) window.toast.success("Actualizado ✅");
      else alert("Actualizado ✅");

      navigate("/admin/productos/seleccionar"); 
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al actualizar";
      if (window?.toast?.error) window.toast.error(msg);
      else alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    const ok = window.confirm("¿Eliminar este producto/servicio? No se puede deshacer.");
    if (!ok) return;
    try {
      setDeleting(true);
      await deleteOneServiceProduct(current._id || current.id);
      if (window?.toast?.success) window.toast.success("Eliminado ✅");
      else alert("Eliminado ✅");
      navigate("productos/seleccionar");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al eliminar";
      if (window?.toast?.error) window.toast.error(msg);
      else alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (!current) {
    return (
      <main className="max-w-5xl mx-auto px-4 pb-20 pt-6">
        <div className="alert alert-info"><span>Cargando producto/servicio…</span></div>
        <div className="mt-4">
          <Link to="/admin/productos/seleccionar" className="btn btn-ghost">Volver</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pb-28 pt-6">
      <header className="mb-6 mt-15 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-secondary bg-clip-text text-transparent">
            Editar {isProduct ? "producto" : "servicio"}
          </span>
        </h1>
        <div className="sm:ml-auto flex gap-2">
          <Link to="/admin/productos/seleccionar" className="btn btn-ghost btn-sm">Volver</Link>
          <button
            type="button"
            className={`btn btn-error btn-sm ${deleting ? "loading" : ""}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Básicos */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="📦" title="Información básica" subtitle="Ajusta los datos comunes." />
            <div className="space-y-4">
              <Field id="title" label="Título" name="title" value={form.title} onChange={onChange} required />
              <Field id="category" label="Categoría" name="category" value={form.category} onChange={onChange} placeholder="ej: figuras, talleres" />
              <FieldSelect id="type" label="Tipo" name="type" value={form.type} onChange={onChange}>
                <option value="product">Producto</option>
                <option value="service">Servicio</option>
              </FieldSelect>
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
              <Field id="shortDescription" label="Resumen" name="shortDescription" value={form.shortDescription} onChange={onChange} placeholder="Texto breve para tarjetas" />
              <FieldArea id="description" label="Descripción" name="description" value={form.description} onChange={onChange} placeholder="Detalles, materiales, requisitos, etc." />
            </div>
          </div>
        </section>

        {/* Producto */}
        {isProduct && (
          <section className="card bg-base-100/70 border border-base-200 shadow-sm">
            <div className="card-body p-5 space-y-5">
              <SectionTitle icon="🛒" title="Detalles de producto" subtitle="Stock y formato de entrega." />
              <div className="space-y-4">
                <Field id="stock" label="Stock" name="stock" type="number" inputMode="numeric" min="0" value={form.stock} onChange={onChange} placeholder="0" />
                <Field id="delivery" label="Entrega/Formato" name="delivery" value={form.delivery} onChange={onChange} placeholder="physical | digital | onsite" hint="Ejemplos: 'physical', 'digital', 'onsite'." />
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
                <Field id="durationMinutes" label="Duración (min)" name="durationMinutes" type="number" inputMode="numeric" min="0" value={form.durationMinutes} onChange={onChange} />
                <Field id="capacity" label="Capacidad (personas)" name="capacity" type="number" inputMode="numeric" min="0" value={form.capacity} onChange={onChange} />
                <Field id="locations" label="Ubicaciones" name="locations" value={form.locations} onChange={onChange} placeholder="Santiago, Valparaíso" hint="Separa múltiples ubicaciones con coma." />
              </div>
            </div>
          </section>
        )}

        {/* Tags */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="🏷️" title="Etiquetas" subtitle="Mejoran la búsqueda y categorización." />
            <div className="space-y-4">
              <Field id="tags" label="Tags" name="tags" value={form.tags} onChange={onChange} placeholder="astro, resina, orion" hint="Usa 2–5 tags relevantes (separados por coma)." />
            </div>
          </div>
        </section>

        {/* Imágenes actuales */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-4">
            <SectionTitle icon="🖼️" title="Imágenes actuales" subtitle="Marca las que quieras eliminar." />
            {existingImages.length === 0 ? (
              <div className="rounded-xl border border-base-300 p-4 text-base-content/70">
                No hay imágenes subidas.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {existingImages.map((img, idx) => (
                  <div key={img.public_id || idx} className="card bg-base-200/70 border border-base-300 shadow-sm">
                    <figure className="aspect-square overflow-hidden">
                      <img src={img.url} alt={img.alt || `img-${idx}`} className="object-cover w-full h-full" />
                    </figure>
                    <div className="card-body p-3 gap-2">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-error"
                          checked={!!toRemove[img.public_id]}
                          onChange={() => toggleRemove(img.public_id)}
                        />
                        <span className="label-text">Quitar</span>
                      </label>
                      {img.alt ? <div className="text-xs opacity-70 break-all">alt: {img.alt}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Agregar nuevas imágenes */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle icon="➕" title="Agregar imágenes" subtitle="Carga nuevas fotos y añade su texto alternativo." />

            <Row label="Subida">
              <div className="flex flex-wrap items-center gap-3">
                <input id="filepick" type="file" multiple accept="image/*" onChange={onPickFiles} className="hidden" />
                <label htmlFor="filepick" className="btn btn-accent btn-sm md:btn-md">📷 Agregar imágenes</label>
                <span className="text-xs opacity-70">Puedes seleccionar varias a la vez.</span>
              </div>
            </Row>

            {preview.length > 0 && (
              <Row label="Vista previa">
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
                          onClick={() => removeNewImage(idx)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Row>
            )}
          </div>
        </section>

        {/* Acciones */}
        <div className="btm-nav md:static md:btm-nav-none md:flex md:justify-end md:gap-3">
          <button type="submit" className={`btn btn-primary btn-sm md:btn-md ${saving ? "loading" : ""}`} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}
