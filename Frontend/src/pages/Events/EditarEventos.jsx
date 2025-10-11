import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../../context/events/eventsContext";
import { useUser } from "../../context/user/UserContext";

function getOwnerId(ev) {
  return (
    ev?.createdBy?._id ||
    ev?.createdBy ||
    ev?.owner?._id ||
    ev?.owner ||
    ev?.user?._id ||
    ev?.user ||
    null
  );
}

function isMine(ev, me) {
  if (!me) return false;
  const ownerId = getOwnerId(ev);
  if (ownerId && me._id && String(ownerId) === String(me._id)) return true;

  
  const org = (ev?.organizer || "").toLowerCase().trim();
  const uname = (me?.username || "").toLowerCase().trim();
  const email = (me?.email || "").toLowerCase().trim();
  return !!org && (org === uname || org === email);
}

export function EditarEventos() {
  const { currentUser } = useUser();

  
  const { PrivateEvents, getPrivateEvents, deleteOneEvent } = useEvents();

  const [selected, setSelected] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getPrivateEvents().catch(() => {});
  }, [getPrivateEvents]);

  const role = String(currentUser?.role || "").toLowerCase().trim();
  const isAdmin = role === "admin";
  

  // admin: todo; superuser/otros: solo propios
  const myEvents = useMemo(() => {
    const list = Array.isArray(PrivateEvents) ? PrivateEvents : [];
    if (isAdmin) return list;
    return list.filter((e) => isMine(e, currentUser));
  }, [PrivateEvents, isAdmin, currentUser]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => !!v).map(([k]) => k),
    [selected]
  );

  const toggleSelect = (id) => setSelected((p) => ({ ...p, [id]: !p[id] }));
 

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // Confirmación
    const n = selectedIds.length;
    const ok = window.confirm(
      n === 1
        ? "¿Eliminar este evento? Esta acción no se puede deshacer."
        : `¿Eliminar ${n} eventos? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      setDeleting(true);

      // Opcional: validar permisos por cada evento (admin puede todo; superuser solo propios)
      const idsToDelete = selectedIds.filter((id) => {
        if (isAdmin) return true;
        const ev = myEvents.find((e) => String(e._id || e.id) === String(id));
        return ev ? isMine(ev, currentUser) : false;
      });

      // Borrado concurrente
      await Promise.all(idsToDelete.map((id) => deleteOneEvent(id)));

        setSelected(prev => {
      const copy = { ...prev };
      idsToDelete.forEach(id => { delete copy[id]; });
      return copy;
    });


      // Feedback
      if (window?.toast?.success) {
        window.toast.success("Evento(s) eliminado(s) ✅");
      } else {
        alert("Evento(s) eliminado(s) ✅");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert(err?.response?.data?.error || err?.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mt-15 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Todos los eventos" : "Mis eventos"}
        </h1>

        <div className="sm:ml-auto flex gap-2">
          <Link to="/admin/eventos/nuevo" className="btn btn-primary btn-sm">
            + Nuevo evento
          </Link>

          {selectedIds.length > 0 && (
            <>
              {/* Botón Eliminar */}
              <button
                className={`btn btn-error btn-sm ${deleting ? "loading" : ""}`}
                onClick={handleBulkDelete}
                disabled={deleting}
                title="Eliminar seleccionados"
              >
                {deleting ? "Eliminando..." : `Eliminar (${selectedIds.length})`}
              </button>

            </>
          )}
        </div>
      </header>

      {!Array.isArray(myEvents) || myEvents.length === 0 ? (
        <div className="rounded-xl border border-base-300 p-6 text-base-content/70">
          {isAdmin ? "No hay eventos en el sistema." : "Aún no has creado eventos."}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myEvents.map((ev) => {
            const id = ev._id || ev.id;
            const start = ev.startDateTime ? new Date(ev.startDateTime) : null;
            const end = ev.endDateTime ? new Date(ev.endDateTime) : null;

            return (
              <li key={id} className="card bg-base-200 shadow-md">
                <div className="card-body gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox mt-1"
                      checked={!!selected[id]}
                      onChange={() => toggleSelect(id)}
                      disabled={deleting}
                    />
                    <div className="flex-1">
                      <h2 className="card-title">{ev.title || "(Sin título)"}</h2>
                      <div className="text-sm opacity-70">
                        {start ? start.toLocaleString() : "Sin inicio"} — {end ? end.toLocaleString() : "Sin término"}
                      </div>
                      <div className="text-sm opacity-70">
                        {ev.isOnline ? "Online" : ev.location || "Sin ubicación"}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="badge">{ev.status || "draft"}</span>
                        {Array.isArray(ev.tags) && ev.tags.length > 0 && (
                          <span className="ml-2 inline-flex flex-wrap gap-1">
                            {ev.tags.map((t, i) => (
                              <span key={i} className="badge badge-outline">{t}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <Link
                      to={`/admin/eventos/editar/${id}`}
                      className="btn btn-secondary btn-sm"
                      aria-disabled={deleting}
                    >
                      Editar
                    </Link>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        aria-disabled={deleting}
                      >
                        Ver enlace
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
