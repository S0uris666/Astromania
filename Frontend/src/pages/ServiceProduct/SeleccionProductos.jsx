import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useServiceProducts } from "../../context/serviceProducts/ServiceProductContext";
import { useUser } from "../../context/user/UserContext";

const TYPE_FILTERS = [
  { value: "all", label: "Todo" },
  { value: "product", label: "Productos" },
  { value: "service", label: "Servicios" },
  { value: "activity", label: "Actividades" },
];

const TYPE_LABEL = {
  product: "Producto",
  service: "Servicio",
  activity: "Actividad",
};

const PLACEHOLDER_ACTIVITY = "https://placehold.co/200x200?text=Actividad";
const PLACEHOLDER_PRODUCT = "https://placehold.co/200x200?text=Producto";
const PLACEHOLDER_SERVICE = "https://placehold.co/200x200?text=Servicio";

const getOwnerId = (item) =>
  item?.createdBy?._id ||
  item?.createdBy ||
  item?.owner?._id ||
  item?.owner ||
  item?.user?._id ||
  item?.user ||
  null;

const isMine = (item, user) => {
  if (!item || !user) return false;
  const ownerId = getOwnerId(item);
  if (ownerId && user._id && String(ownerId) === String(user._id)) return true;
  const author = (item?.organizer || item?.author || "").toLowerCase().trim();
  const username = (user.username || "").toLowerCase().trim();
  const email = (user.email || "").toLowerCase().trim();
  return !!author && (author === username || author === email);
};

const getCover = (item) => {
  const first = item?.images?.[0];
  if (first && (first.url || first.public_id)) return first.url || first.public_id;
  if (Array.isArray(item?.images) && typeof item.images[0] === "string") {
    return item.images[0];
  }
  const type = String(item?.type || "").toLowerCase();
  if (type === "service") return PLACEHOLDER_SERVICE;
  if (type === "activity") return PLACEHOLDER_ACTIVITY;
  return PLACEHOLDER_PRODUCT;
};

const formatPrice = (value) => {
  if (typeof value !== "number") return "A cotizar";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);
};

export function SeleccionProductos() {
  const { currentUser } = useUser();
  const { serviceProduct, getSP, deleteOneServiceProduct } = useServiceProducts();

  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getSP().catch(() => {});
  }, [getSP]);

  const role = String(currentUser?.role || "").toLowerCase().trim();
  const isAdmin = role === "admin";

  const items = useMemo(() => (Array.isArray(serviceProduct) ? serviceProduct : []), [serviceProduct]);

  const filteredItems = useMemo(() => {
    const onlyMine = isAdmin ? items : items.filter((item) => isMine(item, currentUser));
    if (filterType === "all") return onlyMine;
    return onlyMine.filter((item) => String(item?.type || "").toLowerCase() === filterType);
  }, [items, filterType, isAdmin, currentUser]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, checked]) => checked).map(([id]) => id),
    [selected]
  );

  const toggleSelect = (id) =>
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const confirm = window.confirm(
      selectedIds.length === 1
        ? "¿Eliminar el elemento seleccionado? Esta acción no se puede deshacer."
        : `¿Eliminar ${selectedIds.length} elementos? Esta acción no se puede deshacer.`
    );
    if (!confirm) return;

    try {
      setDeleting(true);
      const idsToDelete = selectedIds.filter((id) => {
        if (isAdmin) return true;
        const target = filteredItems.find((item) => String(item._id || item.id) === String(id));
        return target ? isMine(target, currentUser) : false;
      });
      await Promise.all(idsToDelete.map((id) => deleteOneServiceProduct(id)));
      setSelected((prev) => {
        const copy = { ...prev };
        idsToDelete.forEach((id) => delete copy[id]);
        return copy;
      });
      window?.toast?.success?.("Elemento(s) eliminado(s)") ?? alert("Elemento(s) eliminado(s)");
    } catch (error) {
      console.error("Eliminar elementos catálogo error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudieron eliminar los elementos seleccionados";
      window?.toast?.error?.(msg) ?? alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  const createType = filterType === "all" ? "product" : filterType;
  const createLabelMap = {
    product: "Nuevo producto",
    service: "Nuevo servicio",
    activity: "Nueva actividad",
  };
  const createLabel = createLabelMap[createType] || "Nuevo elemento";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="mt-15 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Catálogo completo" : "Mis elementos"}
          </h1>
          <p className="text-sm text-base-content/70">
            Filtra por tipo para gestionar productos, servicios o actividades.
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          {TYPE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm ${filterType === option.value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilterType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          <Link
            to="/admin/productos/nuevo"
            state={{ presetType: createType }}
            className="btn btn-primary btn-sm"
          >
            {createLabel}
          </Link>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className={`btn btn-error btn-sm ${deleting ? "loading" : ""}`}
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : `Eliminar (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      {!filteredItems.length ? (
        <div className="rounded-xl border border-base-300 p-6 text-base-content/70">
          No hay elementos para esta selección.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const idValue = item._id || item.id;
            const type = String(item.type || "").toLowerCase();
            const cover = getCover(item);
            const tags = Array.isArray(item.tags) ? item.tags : [];
            const locations = Array.isArray(item.locations) ? item.locations : [];

            return (
              <li key={idValue} className="card bg-base-200 shadow-md">
                <div className="card-body gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox mt-1"
                      checked={!!selected[idValue]}
                      onChange={() => toggleSelect(idValue)}
                      disabled={deleting}
                    />
                    <figure className="w-16 h-16 rounded overflow-hidden shrink-0 bg-base-300 grid place-items-center">
                      <img src={cover} alt={item.title || "Elemento"} className="object-cover w-full h-full" />
                    </figure>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="card-title text-base">{item.title || "(Sin título)"}</h2>
                        <span className="badge badge-secondary">{TYPE_LABEL[type] || type}</span>
                        {item.active === false && <span className="badge badge-outline">Inactivo</span>}
                      </div>
                      {item.shortDescription && (
                        <p className="text-sm opacity-70 mt-1 line-clamp-3">{item.shortDescription}</p>
                      )}

                      <div className="text-xs opacity-70 mt-2 space-y-1">
                        {type === "product" && (
                          <>
                            <div>Precio: {formatPrice(item.price)}</div>
                            <div>Stock: {typeof item.stock === "number" ? item.stock : "—"}</div>
                            {item.delivery ? <div>Entrega: {item.delivery}</div> : null}
                          </>
                        )}
                        {type === "service" && (
                          <>
                            <div>Precio: {item.price ? formatPrice(item.price) : "A cotizar"}</div>
                            {item.durationMinutes ? <div>Duración: {item.durationMinutes} min</div> : null}
                            {item.capacity ? <div>Capacidad: {item.capacity} personas</div> : null}
                            {locations.length ? <div>Ubicaciones: {locations.join(", ")}</div> : null}
                          </>
                        )}
                        {type === "activity" && (
                          <>
                            {item.location ? <div>Ubicación: {item.location}</div> : null}
                            {Array.isArray(item.links) && item.links.length ? (
                              <div>Enlaces: {item.links.length}</div>
                            ) : null}
                          </>
                        )}
                      </div>

                      {tags.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.map((tag) => (
                            <span key={tag} className="badge badge-outline badge-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="card-actions justify-end">
                    <Link
                      to={`/admin/productos/editar/${idValue}`}
                      className="btn btn-secondary btn-sm"
                      state={{ presetType: type }}
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
