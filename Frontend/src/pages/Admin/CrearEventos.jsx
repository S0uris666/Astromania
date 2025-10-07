import { useState, useMemo } from "react";
import { createEvent } from "../../api/auth";

// convierte 'YYYY-MM-DDTHH:mm' (local) a ISO real
const toISO = (localDt) => (localDt ? new Date(localDt).toISOString() : null);


export function CrearEventos() {
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

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const durationMins = useMemo(() => {
    if (!form.startDateTime || !form.endDateTime) return null;
    const s = new Date(form.startDateTime).getTime();
    const e = new Date(form.endDateTime).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return null;
    return Math.round((e - s) / 60000);
  }, [form.startDateTime, form.endDateTime]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

const sameCalendarDate = (a, b) => {
  if (!a || !b) return false;
  const A = new Date(a), B = new Date(b);
  return A.getFullYear() === B.getFullYear()
    && A.getMonth() === B.getMonth()
    && A.getDate() === B.getDate();
};

const validate = () => {
  const err = {};
  if (!form.title || form.title.trim().length < 3) err.title = "Mínimo 3 caracteres";
  if (!form.description || form.description.trim().length < 10) err.description = "Mínimo 10 caracteres";
  if (!form.organizer) err.organizer = "Requerido";
  if (!form.startDateTime) err.startDateTime = "Requerido";
  if (!form.endDateTime) err.endDateTime = "Requerido";

  if (form.startDateTime && form.endDateTime) {
    const s = new Date(form.startDateTime).getTime();
    const e = new Date(form.endDateTime).getTime();

    if (isNaN(s) || isNaN(e)) {
      err.endDateTime = "Fecha/hora inválida";
    } else if (e <= s) {
      // mismo día permitido, pero hora de término debe ser posterior
      if (sameCalendarDate(form.startDateTime, form.endDateTime)) {
        err.endDateTime = "Misma fecha permitida, pero la hora de término debe ser posterior a la de inicio";
      } else {
        err.endDateTime = "La fecha/hora de término debe ser posterior a la de inicio";
      }
    }
  }

  if (form.price && Number(form.price) < 0) err.price = "No puede ser negativo";
  if (form.capacity && Number(form.capacity) < 0) err.capacity = "No puede ser negativo";

  if (form.url && !/^https?:\/\/.{3,}/i.test(form.url.trim())) {
    err.url = "URL inválida. Ej: https://ejemplo.com/evento";
  }

  setErrors(err);
  return Object.keys(err).length === 0;
};

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        organizer: form.organizer.trim(),
        // si es online y location vacío -> "Online"
        location: (form.isOnline && !form.location.trim()) ? "Online" : form.location.trim(),
        startDateTime: toISO(form.startDateTime),
        endDateTime: toISO(form.endDateTime),
        requiresRegistration: !!form.requiresRegistration,
        price: form.price ? Number(form.price) : 0,
        capacity: form.capacity ? Number(form.capacity) : null,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        isOnline: !!form.isOnline,
        url: form.url.trim(),      // ⬅️ SIEMPRE se envía (vacío o con valor)
        status: form.status,
      };

      await createEvent(payload);
      alert("Evento creado ✅");

      setForm({
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
        url: "", // reset
        status: "draft",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err?.response?.data?.message || "Error al crear el evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mt-15 mb-6">Crear evento</h1>

      <form onSubmit={submit} className="space-y-6">
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

        {/* Modalidad + URL de referencia (siempre visible) */}
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

          {/* URL SIEMPRE visible */}
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

          <div className="md:col-span-2 text-sm text-base-content/70">
            {durationMins ? `Duración estimada: ${durationMins} min` : "Define inicio y término para ver la duración."}
          </div>
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

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creando..." : "Crear evento"}
          </button>
        </div>
      </form>
    </main>
  );
}
