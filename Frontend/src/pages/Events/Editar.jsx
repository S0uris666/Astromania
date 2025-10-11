
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEvents } from "../../context/events/eventsContext";

// Helpers de fecha
const toISO = (localDt) => (localDt ? new Date(localDt).toISOString() : null);
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { PrivateEvents, getPrivateEvents, updateOneEvent } = useEvents();

  // Buscar el evento en store
  const current = useMemo(() => {
    const list = Array.isArray(PrivateEvents) ? PrivateEvents : [];
    return list.find((e) => (e._id || e.id) === id) || null;
  }, [PrivateEvents, id]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    organizer: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    requiresRegistration: false,
    price: "",
    capacity: "",
    tags: "",
    isOnline: false,
    url: "",
    status: "draft",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    if (!current) getPrivateEvents().catch(() => {});
  }, [current, getPrivateEvents]);

  // Hidrata formulario cuando haya current
  useEffect(() => {
    if (!current) return;
    setForm({
      title: current.title || "",
      description: current.description || "",
      organizer: current.organizer || "",
      location: current.location || "",
      startDateTime: toLocalInput(current.startDateTime),
      endDateTime: toLocalInput(current.endDateTime),
      requiresRegistration: !!current.requiresRegistration,
      price: current.price ?? "",
      capacity: current.capacity ?? "",
      tags: Array.isArray(current.tags) ? current.tags.join(", ") : (current.tags || ""),
      isOnline: !!current.isOnline,
      url: current.url || "",
      status: current.status || "draft",
    });
    setErrors({});
  }, [current]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const sameDay = (a, b) => {
    if (!a || !b) return false;
    const A = new Date(a), B = new Date(b);
    return A.getFullYear() === B.getFullYear() &&
           A.getMonth() === B.getMonth() &&
           A.getDate() === B.getDate();
  };

  const validate = () => {
    const err = {};
    if (!form.title || form.title.trim().length < 3) err.title = "Mínimo 3 caracteres";
    if (!form.description || form.description.trim().length < 10) err.description = "Mínimo 10 caracteres";
    if (!form.organizer || form.organizer.trim().length < 3) err.organizer = "Mínimo 3 caracteres";
    if (!form.startDateTime) err.startDateTime = "Requerido";
    if (!form.endDateTime) err.endDateTime = "Requerido";

    if (form.startDateTime && form.endDateTime) {
      const s = new Date(form.startDateTime).getTime();
      const e = new Date(form.endDateTime).getTime();
      if (isNaN(s) || isNaN(e)) {
        err.endDateTime = "Fecha/hora inválida";
      } else if (e <= s) {
        err.endDateTime = sameDay(form.startDateTime, form.endDateTime)
          ? "Misma fecha permitida, pero la hora de término debe ser posterior a la de inicio"
          : "La fecha/hora de término debe ser posterior a la de inicio";
      }
    }

    if (form.price !== "" && Number(form.price) < 0) err.price = "No puede ser negativo";
    if (form.capacity !== "" && Number(form.capacity) < 0) err.capacity = "No puede ser negativo";
    if (form.url && !/^https?:\/\/.{3,}/i.test(form.url.trim())) err.url = "URL inválida. Ej: https://ejemplo.com/evento";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!current) return;
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        organizer: form.organizer.trim(),
        location: form.isOnline && !form.location.trim() ? "Online" : form.location.trim(),
        startDateTime: toISO(form.startDateTime),
        endDateTime: toISO(form.endDateTime),
        requiresRegistration: !!form.requiresRegistration,
        price: form.price === "" ? 0 : Number(form.price),
        capacity: form.capacity === "" ? null : Number(form.capacity),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isOnline: !!form.isOnline,
        url: form.url.trim(),
        status: form.status,
      };

      await updateOneEvent(current._id || current.id, payload);
      alert("Evento actualizado ✅");
      navigate("/admin/eventos/editar");
    } catch (err) {
      alert(err.message || "Error al actualizar el evento");
    } finally {
      setSaving(false);
    }
  };

  if (!current) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="alert alert-info">
          <span>Cargando evento…</span>
        </div>
        <div className="mt-4">
          <Link to="/admin/eventos/editar" className="btn btn-ghost">Volver</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mt-15 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar evento</h1>
        <Link to="/admin/eventos/editar" className="btn btn-ghost btn-sm">Volver</Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Básicos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Título</span>
            <input
              className={`input input-bordered ${errors.title ? "input-error" : ""}`}
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
            {errors.title && <span className="text-error text-xs mt-1">{errors.title}</span>}
          </label>

          <label className="form-control">
            <span className="label-text">Organizador</span>
            <input
              className={`input input-bordered ${errors.organizer ? "input-error" : ""}`}
              name="organizer"
              value={form.organizer}
              onChange={onChange}
              required
            />
            {errors.organizer && <span className="text-error text-xs mt-1">{errors.organizer}</span>}
          </label>

          <label className="form-control md:col-span-2">
            <span className="label-text">Descripción</span>
            <textarea
              className={`textarea textarea-bordered min-h-28 ${errors.description ? "textarea-error" : ""}`}
              name="description"
              value={form.description}
              onChange={onChange}
              required
            />
            {errors.description && <span className="text-error text-xs mt-1">{errors.description}</span>}
          </label>
        </section>

        {/* Modalidad + URL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="form-control md:col-span-2">
            <span className="label-text">Lugar</span>
            <input
              className={`input input-bordered ${form.isOnline ? "opacity-70" : ""}`}
              name="location"
              value={form.location}
              onChange={onChange}
              placeholder={form.isOnline ? "Se guardará como 'Online' si queda vacío" : "Ej: Centro Cultural, Santiago"}
            />
          </label>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              name="isOnline"
              checked={form.isOnline}
              onChange={onChange}
            />
            <span className="label-text">Evento online</span>
          </label>

          <label className="form-control md:col-span-3">
            <span className="label-text">URL de referencia (opcional)</span>
            <input
              className={`input input-bordered ${errors.url ? "input-error" : ""}`}
              name="url"
              value={form.url}
              onChange={onChange}
              placeholder="https://tusitio.com/evento/123"
            />
            {errors.url && <span className="text-error text-xs mt-1">{errors.url}</span>}
          </label>
        </section>

        {/* Fechas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text">Inicio</span>
            <input
              type="datetime-local"
              className={`input input-bordered ${errors.startDateTime ? "input-error" : ""}`}
              name="startDateTime"
              value={form.startDateTime}
              onChange={onChange}
              required
            />
            {errors.startDateTime && <span className="text-error text-xs mt-1">{errors.startDateTime}</span>}
          </label>

          <label className="form-control">
            <span className="label-text">Término</span>
            <input
              type="datetime-local"
              className={`input input-bordered ${errors.endDateTime ? "input-error" : ""}`}
              name="endDateTime"
              value={form.endDateTime}
              min={form.startDateTime || undefined}
              onChange={onChange}
              required
            />
            {errors.endDateTime && <span className="text-error text-xs mt-1">{errors.endDateTime}</span>}
          </label>
        </section>

        {/* Inscripción/Precio/Cupos/Estado */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle"
              name="requiresRegistration"
              checked={form.requiresRegistration}
              onChange={onChange}
            />
            <span className="label-text">Requiere inscripción</span>
          </label>

          <label className="form-control">
            <span className="label-text">Precio (CLP)</span>
            <input
              type="number"
              min="0"
              className={`input input-bordered ${errors.price ? "input-error" : ""}`}
              name="price"
              value={form.price}
              onChange={onChange}
            />
            {errors.price && <span className="text-error text-xs mt-1">{errors.price}</span>}
          </label>

          <label className="form-control">
            <span className="label-text">Cupos</span>
            <input
              type="number"
              min="0"
              className={`input input-bordered ${errors.capacity ? "input-error" : ""}`}
              name="capacity"
              value={form.capacity}
              onChange={onChange}
              placeholder="Vacío = sin límite"
            />
            {errors.capacity && <span className="text-error text-xs mt-1">{errors.capacity}</span>}
          </label>

          <label className="form-control md:col-span-3">
            <span className="label-text">Estado</span>
            <select
              className="select select-bordered"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>
        </section>

        {/* Tags */}
        <section className="grid grid-cols-1 gap-4">
          <label className="form-control">
            <span className="label-text">Tags (separados por coma)</span>
            <input
              className="input input-bordered"
              name="tags"
              value={form.tags}
              onChange={onChange}
              placeholder="astronomía, taller, familiar"
            />
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}
