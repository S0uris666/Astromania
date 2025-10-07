import { useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { createServiceProductRequest } from "../../api/auth.js";

export function CrearProductos() {
  const location = useLocation();
  const presetType = location?.state?.presetType; // "product" | "service"

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

  // helpers
  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const isProduct = useMemo(() => form.type === "product", [form.type]);
  const isService = !isProduct;

  useEffect(() => {
    // Al cambiar de tipo, limpia campos específicos del otro tipo
    setForm((f) => ({
      ...f,
      ...(isProduct
        ? { durationMinutes: "", capacity: "", locations: "" }
        : { stock: "", delivery: "" }),
    }));
  }, [form.type]); // eslint-disable-line

  const onPickFiles = (e) => {
    const f = Array.from(e.target.files || []);
    const merged = [...files, ...f];
    setFiles(merged);
    setAlts((a) => [...a, ...Array(f.length).fill("")]);

    const pv = f.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreview((p) => [...p, ...pv]);
  };

  const onChangeAlt = (idx, value) =>
    setAlts((prev) => prev.map((a, i) => (i === idx ? value : a)));

  const removeImage = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setAlts((prev) => prev.filter((_, i) => i !== idx));
    setPreview((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();

      // básicos
      fd.append("title", form.title);
      fd.append("type", form.type);
      if (form.price) fd.append("price", String(form.price));
      if (form.shortDescription) fd.append("shortDescription", form.shortDescription);
      if (form.description) fd.append("description", form.description);
      if (form.category) fd.append("category", form.category);
      fd.append("active", String(!!form.active));

      // producto
      if (isProduct) {
        if (form.stock) fd.append("stock", String(form.stock));
        if (form.delivery) fd.append("delivery", form.delivery);
      }

      // servicio
      if (isService) {
        if (form.durationMinutes) fd.append("durationMinutes", String(form.durationMinutes));
        if (form.capacity) fd.append("capacity", String(form.capacity));
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

      const { data } = await createServiceProductRequest(fd);
      alert("Creado con éxito ✅");

      // limpiar
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
      console.log("created:", data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <header className="mb-6 mt-15 flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-2xl font-bold">Nuevo {isProduct ? "producto" : "servicio"}</h1>
        <div className="sm:ml-auto">
          <div className="join">
            <button
              type="button"
              className={`btn join-item ${isProduct ? "btn-primary" : "btn-outline"}`}
              onClick={() => setForm((f) => ({ ...f, type: "product" }))}
            >
              Producto
            </button>
            <button
              type="button"
              className={`btn join-item ${isService ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setForm((f) => ({ ...f, type: "service" }))}
            >
              Servicio
            </button>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-6">
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

        {/* Imágenes: botón notorio DaisyUI + previsualización */}
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
              📷 Subir imágenes
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
                      onClick={() => removeImage(idx)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!preview.length && (
            <div className="rounded-2xl border-2 border-dashed border-base-300 p-6 text-center text-base-content/70">
              Arrastra y suelta imágenes aquí, o usa el botón “Subir imágenes”.
            </div>
          )}
        </section>

        <div className="flex justify-end gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creando..." : `Crear ${isProduct ? "producto" : "servicio"}`}
          </button>
        </div>
      </form>
    </main>
  );
}