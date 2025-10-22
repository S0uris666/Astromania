import { useMemo, useState } from "react";
import { BackButton } from "../../components/Common/BackButton.jsx";
import { useEvents } from "../../context/events/eventsContext";

// util
const toISO = (localDt) => (localDt ? new Date(localDt).toISOString() : null);

/* ---------- UI helpers minimal ---------- */
const baseInput =
  "w-full input input-bordered input-sm rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";
const baseSelect =
  "select select-bordered select-sm rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";
const baseTextarea =
  "textarea textarea-bordered textarea-sm rounded-lg min-h-28 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40";

/* Título de sección destacado */
function SectionTitle({ icon = "★", title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold tracking-tight">
          <span className="bg-secondary bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
        <div className="h-1 w-16 rounded-full bg-primary/30 mt-3" />
      </div>
    </div>
  );
}

/* Row y campos */
function Row({ label, children, htmlFor }) {
  return (
    <div className="md:relative">
      <label
        htmlFor={htmlFor}
        className="label md:absolute md:left-0 md:top-1 md:w-56 pb-0"
      >
        <span className="label-text text-sm font-medium opacity-90">
          {label}
        </span>
      </label>
      <div className="md:ml-56">{children}</div>
    </div>
  );
}

function Field({ id, label, error, hint, ...inputProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control gap-1.5">
        <input id={id} className={`${baseInput} ${error ? "input-error" : ""}`} {...inputProps} />
        <div className="flex justify-between">
          {hint ? <span className="text-xs opacity-60">{hint}</span> : <span />}
          {error ? <span className="text-error text-xs">{error}</span> : null}
        </div>
      </div>
    </Row>
  );
}

function FieldArea({ id, label, error, hint, ...areaProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control gap-1.5">
        <textarea id={id} className={`${baseTextarea} ${error ? "textarea-error" : ""}`} {...areaProps} />
        <div className="flex justify-between">
          {hint ? <span className="text-xs opacity-60">{hint}</span> : <span />}
          {error ? <span className="text-error text-xs">{error}</span> : null}
        </div>
      </div>
    </Row>
  );
}

function FieldSelect({ id, label, error, children, ...selectProps }) {
  return (
    <Row label={label} htmlFor={id}>
      <div className="form-control gap-1.5">
        <select id={id} className={`${baseSelect} ${error ? "select-error" : ""}`} {...selectProps}>
          {children}
        </select>
        {error ? <span className="text-error text-xs">{error}</span> : null}
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
/* --------------------------------------- */

export function CrearEventos() {
  const { createOneEvent, loading, error } = useEvents();

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
    urlOnline: "",           // 🔹 NUEVO en el estado
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
    return A.getFullYear() === B.getFullYear() && A.getMonth() === B.getMonth() && A.getDate() === B.getDate();
  };

  const validate = () => {
    const err = {};
    if (!form.title || form.title.trim().length < 3) err.title = "Mínimo 3 caracteres.";
    if (!form.description || form.description.trim().length < 10) err.description = "Mínimo 10 caracteres.";
    if (!form.organizer || form.organizer.trim().length < 3) err.organizer = "Mínimo 3 caracteres.";
    if (!form.startDateTime) err.startDateTime = "Requerido.";
    if (!form.endDateTime) err.endDateTime = "Requerido.";

    if (form.startDateTime && form.endDateTime) {
      const s = new Date(form.startDateTime).getTime();
      const e = new Date(form.endDateTime).getTime();
      if (isNaN(s) || isNaN(e)) err.endDateTime = "Fecha/hora inválida.";
      else if (e <= s) {
        err.endDateTime = sameCalendarDate(form.startDateTime, form.endDateTime)
          ? "Misma fecha OK, pero hora de término posterior."
          : "La fecha/hora de término debe ser posterior a la de inicio.";
      }
    }

    if (form.price && Number(form.price) < 0) err.price = "No puede ser negativo.";
    if (form.capacity && Number(form.capacity) < 0) err.capacity = "No puede ser negativo.";
    if (form.url && !/^https?:\/\/.{3,}/i.test(form.url.trim())) err.url = "URL inválida. Ej: https://ejemplo.com/evento";

    // Validación para urlOnline cuando es online
    if (form.isOnline) {
      if (!form.urlOnline?.trim()) {
        err.urlOnline = "Ingresa la URL del evento online.";
      } else if (!/^https?:\/\/.{3,}/i.test(form.urlOnline.trim())) {
        err.urlOnline = "URL online inválida. Ej: https://zoom.us/j/...";
      }
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
        // Mantengo tu lógica: si es online y queda vacío, guardas "Online"
        location: form.isOnline && !form.location.trim() ? "Online" : form.location.trim(),
        startDateTime: toISO(form.startDateTime),
        endDateTime: toISO(form.endDateTime),
        requiresRegistration: !!form.requiresRegistration,
        price: form.price ? Number(form.price) : 0,
        capacity: form.capacity ? Number(form.capacity) : null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isOnline: !!form.isOnline,
        url: form.url.trim(),
        status: form.status,
        urlOnline: form.urlOnline.trim(),
      };
      await createOneEvent(payload);
      alert("Evento creado ✅");
      setForm({
        title: "", description: "", organizer: "", location: "",
        startDateTime: "", endDateTime: "", requiresRegistration: false,
        price: "", capacity: "", tags: "", isOnline: false, url: "", status: "draft",
        urlOnline: "", // 🔹 reset
      });
      setErrors({});
    } catch (err) {
      alert(err.message || "Error al crear el evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mt-15 max-w-4xl mx-auto px-4 pb-28 pt-6">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-white bg-clip-text text-transparent">
            Crear evento
          </span>
        </h1>
        <BackButton fallback="/admin/eventos/editar" />
        
      </header>

      {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

      <form onSubmit={submit} className="space-y-6">
        {/* Básicos */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle
              icon="📄"
              title="Información básica"
              subtitle="Nombre, organización y una breve descripción del evento."
            />
            <div className="space-y-4">
              <Field
                id="title"
                label="Título"
                value={form.title}
                onChange={onChange}
                name="title"
                placeholder="Ej: Observación de estrellas en el cerro"
                required
                error={errors.title}
              />
              <Field
                id="organizer"
                label="Organizador"
                value={form.organizer}
                onChange={onChange}
                name="organizer"
                placeholder="Ej: Fundación Astromanía"
                required
                error={errors.organizer}
              />
              <FieldArea
                id="description"
                label="Descripción"
                value={form.description}
                onChange={onChange}
                name="description"
                placeholder="¿De qué trata? Público objetivo, dinámica, materiales, etc."
                required
                hint="Mínimo 10 caracteres."
                error={errors.description}
              />
            </div>
          </div>
        </section>

        {/* Modalidad y referencia */}
<section className="card bg-base-100/70 border border-base-200 shadow-sm">
  <div className="card-body p-5 space-y-5">
    <SectionTitle
      icon="🌐"
      title="Modalidad y referencia"
      subtitle="Define si es presencial u online y agrega enlaces útiles."
    />

    <div className="space-y-4">
      <Field
        id="location"
        label="Lugar"
        value={form.location}
        onChange={onChange}
        name="location"
        placeholder={form.isOnline ? "Se guardará como 'Online' si queda vacío" : "Ej: Centro Cultural, Santiago"}
        hint="Sé específico si es presencial."
      />

      <FieldToggle
        label="Modalidad"
        checked={form.isOnline}
        onChange={(e) =>
          onChange({ target: { name: "isOnline", type: "checkbox", checked: e.target.checked } })
        }
        textRight="Evento online"
      />

      {/* URL general: SIEMPRE visible (opcional) */}
      <Field
        id="url"
        label="URL de referencia"
        value={form.url}
        onChange={onChange}
        name="url"
        placeholder="https://tusitio.com/evento/123"
        hint="Página del evento, formulario, etc. (opcional)"
        error={errors.url}
        type="url"
        pattern="https?://.+"
        title="Debe comenzar con http:// o https://"
      />

      
{form.isOnline && (
  <Field
    id="urlOnline"
    label="URL del evento online"
    value={form.urlOnline}
    onChange={onChange}
    name="urlOnline"
    placeholder="https://zoom.us/j/..."
    hint="Requerida cuando el evento es online."
    error={errors.urlOnline}
    type="url"
    pattern="https?://.+"
    title="Debe comenzar con http:// o https://"
    required
  />
)}
    </div>
  </div>
</section>


        {/* Fechas */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle
              icon="⏰"
              title="Fechas y duración"
              subtitle="Configura hora de inicio, término y revisa la duración estimada."
            />
            <div className="space-y-4">
              <Row label="Inicio" htmlFor="startDateTime">
                <div className="form-control">
                  <input
                    id="startDateTime"
                    type="datetime-local"
                    className={`${baseInput} ${errors.startDateTime ? "input-error" : ""}`}
                    name="startDateTime"
                    value={form.startDateTime}
                    onChange={onChange}
                    required
                  />
                  {errors.startDateTime && <span className="text-error text-xs mt-1">{errors.startDateTime}</span>}
                </div>
              </Row>

              <Row label="Término" htmlFor="endDateTime">
                <div className="form-control">
                  <input
                    id="endDateTime"
                    type="datetime-local"
                    className={`${baseInput} ${errors.endDateTime ? "input-error" : ""}`}
                    name="endDateTime"
                    value={form.endDateTime}
                    min={form.startDateTime || undefined}
                    onChange={onChange}
                    required
                  />
                  {errors.endDateTime && <span className="text-error text-xs mt-1">{errors.endDateTime}</span>}
                </div>
              </Row>

              <Row label="Duración">
                <div className="text-sm opacity-80">
                  {durationMins ? (
                    <span className="badge badge-ghost">{`~ ${durationMins} min`}</span>
                  ) : (
                    "Define inicio y término para calcular duración."
                  )}
                </div>
              </Row>
            </div>
          </div>
        </section>

        {/* Inscripción y visibilidad */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle
              icon="🧾"
              title="Inscripción y visibilidad"
              subtitle="Precio, cupos y estado público del evento."
            />
            <div className="space-y-4">
              <FieldToggle
                label="Inscripción"
                checked={form.requiresRegistration}
                onChange={(e) =>
                  onChange({ target: { name: "requiresRegistration", type: "checkbox", checked: e.target.checked } })
                }
                textRight="Requiere inscripción"
              />

              <Field
                id="price"
                label="Precio (CLP)"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.price}
                onChange={onChange}
                name="price"
                placeholder="0 = gratuito"
                error={errors.price}
              />

              <Field
                id="capacity"
                label="Cupos"
                type="number"
                inputMode="numeric"
                min="0"
                value={form.capacity}
                onChange={onChange}
                name="capacity"
                placeholder="Vacío = sin límite"
                error={errors.capacity}
              />

              <FieldSelect
                id="status"
                label="Estado"
                value={form.status}
                onChange={onChange}
                name="status"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="cancelled">Cancelado</option>
              </FieldSelect>
            </div>
          </div>
        </section>

        {/* Etiquetas */}
        <section className="card bg-base-100/70 border border-base-200 shadow-sm">
          <div className="card-body p-5 space-y-5">
            <SectionTitle
              icon="🏷️"
              title="Etiquetas"
              subtitle="Ayuda a tu audiencia a encontrar tu evento."
            />
            <div className="space-y-4">
              <Field
                id="tags"
                label="Tags"
                value={form.tags}
                onChange={onChange}
                name="tags"
                placeholder="astronomía, taller, familiar"
                hint="Usa 2–5 tags relevantes (separados por coma)."
              />
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="btm-nav md:static md:btm-nav-none md:flex md:justify-end md:gap-3">
          <button type="button" className="btn btn-ghost btn-sm md:btn-md" onClick={() => window.history.back()}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm md:btn-md" disabled={submitting || loading}>
            {submitting || loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Creando…
              </span>
            ) : (
              "Crear evento"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
