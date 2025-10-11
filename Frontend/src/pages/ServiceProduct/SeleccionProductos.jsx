// src/pages/Admin/EditarProductos.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";
import { useUser } from "../../context/user/UserContext";

// --- helpers de ownership (similar a eventos) ---
function getOwnerId(sp) {
  return (
    sp?.createdBy?._id ||
    sp?.createdBy ||
    sp?.owner?._id ||
    sp?.owner ||
    sp?.user?._id ||
    sp?.user ||
    null
  );
}
function isMine(sp, me) {
  if (!me) return false;
  const ownerId = getOwnerId(sp);
  if (ownerId && me._id && String(ownerId) === String(me._id)) return true;
  // fallback textual: no siempre aplica a productos, pero lo dejamos por si guardas username/email en algún campo
  const authorTxt = (sp?.organizer || sp?.author || "").toLowerCase().trim();
  const uname = (me?.username || "").toLowerCase().trim();
  const email = (me?.email || "").toLowerCase().trim();
  return !!authorTxt && (authorTxt === uname || authorTxt === email);
}

export function SeleccionProductos() {
  const { currentUser } = useUser();
  const { serviceProduct, getSP, deleteOneServiceProduct } = useServiceProducts();

  const [selected, setSelected] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSP().catch(() => {});
  }, [getSP]);

  const role = String(currentUser?.role || "").toLowerCase().trim();
  const isAdmin = role === "admin";

  // Admin: todo. Superuser/otros: solo propios
  const myItems = useMemo(() => {
    const list = Array.isArray(serviceProduct) ? serviceProduct : [];
    if (isAdmin) return list;
    return list.filter((sp) => isMine(sp, currentUser));
  }, [serviceProduct, isAdmin, currentUser]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => !!v).map(([k]) => k),
    [selected]
  );

  const toggleSelect = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const n = selectedIds.length;
    const ok = window.confirm(
      n === 1
        ? "¿Eliminar este ítem? Esta acción no se puede deshacer."
        : `¿Eliminar ${n} ítems? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      setDeleting(true);

      // Validación de permisos por ítem (admin todo; superuser solo propios)
      const idsToDelete = selectedIds.filter((id) => {
        if (isAdmin) return true;
        const sp = myItems.find((x) => String(x._id || x.id) === String(id));
        return sp ? isMine(sp, currentUser) : false;
      });

      // Borrado concurrente
      await Promise.all(idsToDelete.map((id) => deleteOneServiceProduct(id)));

      // Limpiar selección SOLO de los borrados
      setSelected((prev) => {
        const copy = { ...prev };
        idsToDelete.forEach((id) => delete copy[id]);
        return copy;
      });

      if (window?.toast?.success) window.toast.success("Ítem(s) eliminado(s) ✅");
      else alert("Ítem(s) eliminado(s) ✅");
    } catch (err) {
      console.error("Bulk delete products error:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Error al eliminar";
      if (window?.toast?.error) window.toast.error(msg);
      else alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mt-15 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">{isAdmin ? "Todos los productos/servicios" : "Mis productos/servicios"}</h1>

        <div className="sm:ml-auto flex gap-2">
          <Link to="/admin/productos/nuevo" className="btn btn-primary btn-sm">
            + Nuevo
          </Link>

          {selectedIds.length > 0 && (
            <button
              className={`btn btn-error btn-sm ${deleting ? "loading" : ""}`}
              onClick={handleBulkDelete}
              disabled={deleting}
              title="Eliminar seleccionados"
            >
              {deleting ? "Eliminando..." : `Eliminar (${selectedIds.length})`}
            </button>
          )}
        </div>
      </header>

      {!Array.isArray(myItems) || myItems.length === 0 ? (
        <div className="rounded-xl border border-base-300 p-6 text-base-content/70">
          {isAdmin ? "No hay productos/servicios en el sistema." : "Aún no has creado productos/servicios."}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myItems.map((sp) => {
            const id = sp._id || sp.id;
            const isProduct = String(sp?.type || "").toLowerCase() === "product";
            const cover = sp?.images?.[0]?.url || sp?.image || null;

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

                    {/* Mini preview */}
                    {cover && (
                      <figure className="w-16 h-16 rounded overflow-hidden shrink-0">
                        <img src={cover} alt={sp?.title || "cover"} className="object-cover w-full h-full" />
                      </figure>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="card-title">{sp.title || "(Sin título)"}</h2>
                        <span className={`badge ${isProduct ? "badge-primary" : "badge-secondary"}`}>
                          {isProduct ? "Producto" : "Servicio"}
                        </span>
                        {sp.active === false && <span className="badge badge-outline">inactivo</span>}
                      </div>

                      <div className="text-sm opacity-70">
                        {isProduct ? (
                          <>
                            <span>Precio: {Number.isFinite(sp.price) ? `CLP ${sp.price}` : "—"}</span>{" · "}
                            <span>Stock: {Number.isFinite(sp.stock) ? sp.stock : "—"}</span>
                          </>
                        ) : (
                          <>
                            <span>Precio: {Number.isFinite(sp.price) ? `CLP ${sp.price}` : "—"}</span>{" · "}
                            <span>Duración: {Number.isFinite(sp.durationMinutes) ? `${sp.durationMinutes} min` : "—"}</span>{" · "}
                            <span>Capacidad: {Number.isFinite(sp.capacity) ? sp.capacity : "—"}</span>
                          </>
                        )}
                      </div>

                      {Array.isArray(sp.tags) && sp.tags.length > 0 && (
                        <div className="mt-1 inline-flex flex-wrap gap-1">
                          {sp.tags.map((t, i) => (
                            <span key={i} className="badge badge-outline">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <Link
                      to={`/admin/productos/editar/${id}`}
                      className="btn btn-secondary btn-sm"
                      aria-disabled={deleting}
                    >
                      Editar
                    </Link>
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
