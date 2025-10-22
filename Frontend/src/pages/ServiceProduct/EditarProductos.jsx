import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BackButton } from "../../components/Common/BackButton.jsx";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";

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

const EMPTY_FORM = {
  title: "",
  type: "product",
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

export function EditarProductos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { serviceProduct, getSP, updateSP, deleteOneServiceProduct } = useServiceProducts();

  const [form, setForm] = useState(EMPTY_FORM);
  const [links, setLinks] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [toRemove, setToRemove] = useState({});

  const [files, setFiles] = useState([]);
  const [alts, setAlts] = useState([]);
  const [preview, setPreview] = useState([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSP().catch(() => {});
  }, [getSP]);

  const current = useMemo(() => {
    const list = Array.isArray(serviceProduct) ? serviceProduct : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [serviceProduct, id]);

  useEffect(() => {
    if (!current) return;
    const type = String(current.type || "product").toLowerCase();
    const tagString = Array.isArray(current.tags) ? current.tags.join(", ") : "";
    const locationsString = Array.isArray(current.locations) ? current.locations.join(", ") : "";
    setForm({
      title: current.title || "",
      type,
      category: current.category || "",
      shortDescription: current.shortDescription || "",
      description: current.description || "",
      location: current.location || "",
      price: typeof current.price === "number" ? String(current.price) : "",
      tags: tagString,
      active: current.active !== false,
      stock: typeof current.stock === "number" ? String(current.stock) : "",
      delivery: current.delivery || "",
      durationMinutes: typeof current.durationMinutes === "number" ? String(current.durationMinutes) : "",
      capacity: typeof current.capacity === "number" ? String(current.capacity) : "",
      locations: locationsString,
    });
    setLinks(
      type === "activity" && Array.isArray(current.links) && current.links.length
        ? current.links.map((link) => ({
            label: link.label || "",
            url: link.url || "",
          }))
        : type === "activity"
        ? [LINK_TEMPLATE]
        : []
    );
    setExistingImages(Array.isArray(current.images) ? current.images : []);
    setToRemove({});
    setFiles([]);
    setAlts([]);
    setPreview([]);
  }, [current]);

  useEffect(
    () => () => {
      preview.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [preview]
  );

  if (!current) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="opacity-70">Buscando la información de la actividad...</p>
        <Link to="/admin/productos/seleccionar" className="btn btn-primary">
          Regresar
        </Link>
      </main>
    );
  }

  const isProduct = form.type === "product";
  const isService = form.type === "service";
  const isActivity = form.type === "activity";

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

  const updateForm = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const toggleRemoveImage = (publicId) => {
    setToRemove((prev) => ({
      ...prev,
      [publicId]: !prev[publicId],
    }));
  };

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

  const removeNewImage = (index) => {
    const item = preview[index];
    if (item) URL.revokeObjectURL(item.url);
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    setAlts((prev) => prev.filter((_, idx) => idx !== index));
    setPreview((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("type", form.type);
      fd.append("active", String(!!form.active));

      fd.append("category", form.category.trim());
      fd.append("shortDescription", form.shortDescription.trim());
      fd.append("description", form.description.trim());

      if (!isActivity) {
        fd.append("price", form.price.trim());
      }

      if (isProduct) {
        fd.append("stock", form.stock.trim());
        fd.append("delivery", form.delivery.trim());
      }

      if (isService) {
        fd.append("durationMinutes", form.durationMinutes.trim());
        fd.append("capacity", form.capacity.trim());
        const locs = form.locations
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        fd.append("locations", JSON.stringify(locs));
      } else {
        fd.append("locations", JSON.stringify([]));
      }

      if (isActivity) {
        fd.append("location", form.location.trim());
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

      const removeIds = Object.entries(toRemove)
        .filter(([, value]) => value)
        .map(([key]) => key);
      fd.append("removePublicIds", JSON.stringify(removeIds));

      fd.append("alts", JSON.stringify(alts));
      files.forEach((file) => fd.append("images", file));

      await updateSP(current._id || current.id, fd);

      window?.toast?.success?.("Cambios guardados") ?? alert("Cambios guardados");
      setFiles([]);
      setAlts([]);
      setPreview([]);
      setToRemove({});
      await getSP();
    } catch (error) {
      console.error("Actualizar elemento catálogo error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo actualizar el elemento";
      window?.toast?.error?.(msg) ?? alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("¿Eliminar este elemento? Esta acción no se puede deshacer.");
    if (!confirm) return;
    try {
      setDeleting(true);
      await deleteOneServiceProduct(current._id || current.id);
      window?.toast?.success?.("Elemento eliminado") ?? alert("Elemento eliminado");
      navigate("/admin/productos/seleccionar");
    } catch (error) {
      console.error("Eliminar elemento catálogo error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo eliminar el elemento";
      window?.toast?.error?.(msg) ?? alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="mt-15 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar {TYPE_LABEL[form.type]}</h1>
          <p className="text-sm text-base-content/70">
            Actualiza la información, imágenes y enlaces de este elemento del catálogo.
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <BackButton fallback="/admin/productos/seleccionar" />
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
        <Section title="Información básica" subtitle="Actualiza el contenido principal visible en el catálogo.">
          <Row label="Título" htmlFor="title">
            <input
              id="title"
              name="title"
              className={baseInput}
              value={form.title}
              onChange={updateForm}
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
            />
          </Row>
          <Row label="Descripción" htmlFor="description">
            <textarea
              id="description"
              name="description"
              className={baseTextarea}
              value={form.description}
              onChange={updateForm}
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
              />
            </Row>
            <Row label="Entrega / Formato" htmlFor="delivery">
              <input
                id="delivery"
                name="delivery"
                className={baseInput}
                value={form.delivery}
                onChange={updateForm}
              />
            </Row>
          </Section>
        )}

        {isService && (
          <Section title="Detalles de servicio" subtitle="Duración, aforo y ubicaciones disponibles.">
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

        <Section title="Etiquetas y enlaces" subtitle="Mejoran la búsqueda y añaden material adicional.">
          <Row label="Etiquetas" htmlFor="tags">
            <input
              id="tags"
              name="tags"
              className={baseInput}
              value={form.tags}
              onChange={updateForm}
              placeholder="astro, divulgación, familia"
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

        <Section title="Imágenes" subtitle="Gestiona las imágenes existentes y agrega nuevas.">
          <Row label="Actuales">
            {existingImages.length === 0 ? (
              <div className="rounded-xl border border-base-300 p-4 text-base-content/70">No hay imágenes cargadas.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {existingImages.map((img) => (
                  <div key={img.public_id} className="card bg-base-200/70 border border-base-300 shadow-sm">
                    <figure className="aspect-square overflow-hidden">
                      <img src={img.url} alt={img.alt || "cover"} className="object-cover w-full h-full" />
                    </figure>
                    <div className="card-body p-3 gap-2">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-error"
                          checked={!!toRemove[img.public_id]}
                          onChange={() => toggleRemoveImage(img.public_id)}
                        />
                        <span className="label-text text-sm">Quitar</span>
                      </label>
                      {img.alt ? <p className="text-xs opacity-70 break-all">alt: {img.alt}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Row>

          <Row label="Agregar nuevas">
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

          {preview.length > 0 && (
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
                      <button type="button" className="btn btn-ghost btn-xs" onClick={() => removeNewImage(index)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          )}
        </Section>

        <div className="btm-nav md:static md:btm-nav-none md:flex md:justify-end md:gap-3">
          <button type="submit" className={`btn btn-primary btn-sm md:btn-md ${saving ? "loading" : ""}`} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}

