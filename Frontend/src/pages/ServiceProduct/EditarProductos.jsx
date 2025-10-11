// src/pages/Admin/EditarProducto.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";

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
    type: "product", // product | service (se prefiere mantener el existente)
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

  // Imágenes actuales (del backend)
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

  // Si no está en memoria, trae la lista (para poder encontrarlo)
  useEffect(() => {
    if (!current) getSP().catch(() => {});
  }, [current, getSP]);

  // Hidrata el formulario cuando current cambia
  useEffect(() => {
    if (!current) return;

    // tags a string
    const tagsStr = Array.isArray(current.tags) ? current.tags.join(", ") : (current.tags || "");

    // locations a string
    const locationsStr = Array.isArray(current.locations)
      ? current.locations.join(", ")
      : (current.locations || "");

    // imágenes existentes
    const imgs = Array.isArray(current.images) ? current.images : [];
    setExistingImages(imgs);
    setToRemove({});

    // set form
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
    setFiles([]);
    setAlts([]);
    setPreview([]);
  }, [current]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleRemove = (publicId) => {
    setToRemove((p) => ({ ...p, [publicId]: !p[publicId] }));
  };

  const onPickFiles = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...f]);
    setAlts((a) => [...a, ...Array(f.length).fill("")]);
    const pv = f.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreview((p) => [...p, ...pv]);
  };

  const onChangeAlt = (idx, value) =>
    setAlts((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const removeNewImage = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setAlts((prev) => prev.filter((_, i) => i !== idx));
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!current) return;

    try {
      setSaving(true);

      const fd = new FormData();

      // Campos básicos
      fd.append("title", form.title);
      fd.append("type", form.type); // normalmente no se cambia, pero soportamos por si acaso
      if (form.price !== "") fd.append("price", String(form.price));
      if (form.shortDescription) fd.append("shortDescription", form.shortDescription);
      if (form.description) fd.append("description", form.description);
      if (form.category) fd.append("category", form.category);
      fd.append("active", String(!!form.active));

      // Producto
      if (isProduct) {
        if (form.stock !== "") fd.append("stock", String(form.stock));
        if (form.delivery) fd.append("delivery", form.delivery);
      }

      // Servicio
      if (isService) {
        if (form.durationMinutes !== "") fd.append("durationMinutes", String(form.durationMinutes));
        if (form.capacity !== "") fd.append("capacity", String(form.capacity));
        const locs = form.locations
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        fd.append("locations", JSON.stringify(locs));
      }

      // Tags
      const tagsArr = form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      fd.append("tags", JSON.stringify(tagsArr));

      // Imágenes nuevas + alts
      files.forEach((f) => fd.append("images", f));
      fd.append("alts", JSON.stringify(alts));

      // Imágenes a eliminar (public_id)
      const removeIds = Object.entries(toRemove)
        .filter(([, v]) => !!v)
        .map(([k]) => k);
      if (removeIds.length) {
        fd.append("removePublicIds", JSON.stringify(removeIds));
      }

      await updateSP(current._id || current.id, fd);

      if (window?.toast?.success) window.toast.success("Actualizado ✅");
      else alert("Actualizado ✅");

      navigate("/admin"); // ajusta a tu ruta de listado
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
      navigate("/admin/productos"); // ajusta a tu ruta de listado
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
      <main className="max-w-5xl mx-auto p-6">
        <div className="alert alert-info">
          <span>Cargando producto/servicio…</span>
        </div>
        <div className="mt-4">
          <Link to="/admin/productos/seleccionar" className="btn btn-ghost">Volver</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <header className="mb-6 mt-15 flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl font-bold">Editar {isProduct ? "producto" : "servicio"}</h1>
        <div className="sm:ml-auto flex gap-2">
          <Link to="/admin/productos" className="btn btn-ghost btn-sm">Volver</Link>
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Título</span>
            <input
              className="input input-bordered"
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">Categoría</span>
            <input
              className="input input-bordered"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="ej: figuras, talleres"
            />
          </label>

          <label className="form-control">
            <span className="label-text">Tipo</span>
            <select
              name="type"
              className="select select-bordered"
              value={form.type}
              onChange={onChange}
            >
              <option value="product">Producto</option>
              <option value="service">Servicio</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text">Precio (CLP)</span>
            <input
              className="input input-bordered"
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={onChange}
              placeholder={isService ? "Opcional para servicios" : "0"}
            />
          </label>

          <label className="form-control">
            <span className="label-text">Activo</span>
            <div className="flex items-center h-12">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                name="active"
                checked={form.active}
                onChange={onChange}
              />
            </div>
          </label>

          <label className="form-control md:col-span-2">
            <span className="label-text">Resumen</span>
            <input
              className="input input-bordered"
              name="shortDescription"
              value={form.shortDescription}
              onChange={onChange}
            />
          </label>

          <label className="form-control md:col-span-2">
            <span className="label-text">Descripción</span>
            <textarea
              className="textarea textarea-bordered min-h-28"
              name="description"
              value={form.description}
              onChange={onChange}
            />
          </label>
        </section>

        {/* Producto */}
        {isProduct && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text">Stock</span>
              <input
                className="input input-bordered"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={onChange}
              />
            </label>

            <label className="form-control">
              <span className="label-text">Entrega/Formato</span>
              <input
                className="input input-bordered"
                name="delivery"
                value={form.delivery}
                onChange={onChange}
                placeholder="physical | digital | onsite"
              />
            </label>
          </section>
        )}

        {/* Servicio */}
        {isService && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="form-control">
              <span className="label-text">Duración (min)</span>
              <input
                className="input input-bordered"
                name="durationMinutes"
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={onChange}
              />
            </label>

            <label className="form-control">
              <span className="label-text">Capacidad (personas)</span>
              <input
                className="input input-bordered"
                name="capacity"
                type="number"
                min="0"
                value={form.capacity}
                onChange={onChange}
              />
            </label>

            <label className="form-control">
              <span className="label-text">Ubicaciones (coma)</span>
              <input
                className="input input-bordered"
                name="locations"
                value={form.locations}
                onChange={onChange}
                placeholder="Santiago, Valparaíso"
              />
            </label>
          </section>
        )}

        {/* Tags */}
        <section className="grid grid-cols-1 gap-4">
          <label className="form-control">
            <span className="label-text">Tags (separados por coma)</span>
            <input
              className="input input-bordered"
              name="tags"
              value={form.tags}
              onChange={onChange}
              placeholder="astro,resina,orion"
            />
          </label>
        </section>

        {/* Imágenes existentes con “quitar” */}
        <section className="space-y-3">
          <h3 className="font-semibold">Imágenes actuales</h3>
          {existingImages.length === 0 ? (
            <div className="rounded-xl border border-base-300 p-4 text-base-content/70">
              No hay imágenes subidas.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {existingImages.map((img, idx) => (
                <div key={img.public_id || idx} className="card bg-base-200 shadow-sm">
                  <figure className="aspect-square overflow-hidden">
                    <img src={img.url} alt={img.alt || `img-${idx}`} className="object-cover w-full h-full" />
                  </figure>
                  <div className="card-body p-3">
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
        </section>

        {/* Agregar nuevas imágenes */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="filepick"
              type="file"
              multiple
              accept="image/*"
              onChange={onPickFiles}
              className="file-input file-input-accent file-input-lg w-full max-w-md"
            />
            <label htmlFor="filepick" className="btn btn-accent btn-lg">
              📷 Agregar imágenes
            </label>
          </div>

          {!!preview.length && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {preview.map((p, idx) => (
                <div key={p.url} className="card bg-base-200 shadow-sm">
                  <figure className="aspect-square overflow-hidden">
                    <img src={p.url} alt={p.name} className="object-cover w-full h-full" />
                  </figure>
                  <div className="card-body p-3">
                    <input
                      className="input input-bordered input-sm"
                      placeholder="Alt de la imagen"
                      value={alts[idx] || ""}
                      onChange={(e) => onChangeAlt(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs mt-2"
                      onClick={() => removeNewImage(idx)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-3">
          <button type="submit" className={`btn btn-primary ${saving ? "loading" : ""}`} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}
