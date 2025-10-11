// src/pages/Admin/AdminUsers.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGetAllUsersAdmin, apiPromoteToSuperuser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

export function AdminUsers() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [users, setUsers]     = useState([]);

  // búsqueda client-side
  const [query, setQuery]     = useState("");

  // paginación client-side (simple)
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // tu API devuelve axios response -> data es la carga útil;
        // si viene como { data, total, pages }, ajusta abajo.
        const res = await apiGetAllUsersAdmin();
        const payload = res?.data?.data || res?.data || []; // intenta ambos formatos
        if (!alive) return;
        setUsers(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Error al obtener usuarios";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const normalized = useMemo(
    () =>
      (users || []).map((u) => ({
        _id: u._id,
        username: u.username || "",
        email: u.email || "",
        role: (u.role || "").toLowerCase(),
        createdAt: u.createdAt,
      })),
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [normalized, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const handlePromote = async (id) => {
    const target = normalized.find((u) => u._id === id);
    if (!target) return;
    if (target.role !== "user") {
      alert("Solo puedes promover cuentas con rol 'user'.");
      return;
    }
    if (!confirm(`¿Promover a ${target.email} a Divulgador?`)) return;

    try {
      await apiPromoteToSuperuser(id);
      // Refrescar en memoria sin re-fetch:
      setUsers((prev) =>
        (prev || []).map((u) =>
          u._id === id ? { ...u, role: "superuser" } : u
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo actualizar el rol";
      alert(msg);
    }
  };

  return (
    <main className="mt-15 max-w-7xl mx-auto px-4 py-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <div className="sm:ml-auto flex items-center gap-2">
          <button className="btn btn-ghost" onClick={() => navigate("/admin")}>
            ← Volver
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
          className="input input-bordered w-full"
          placeholder="Buscar por nombre, email o rol…"
        />

        <div className="flex gap-2">
          <select
            className="select select-bordered w-40"
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value));
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Creado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Cargando…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-error">
                  {error}
                </td>
              </tr>
            ) : pageSlice.length === 0 ? (
              <tr>
                <td colSpan={5}>Sin resultados</td>
              </tr>
            ) : (
              pageSlice.map((u) => (
                <tr key={u._id}>
                  <td className="font-medium">{u.username || "—"}</td>
                  <td className="truncate">{u.email}</td>
                  <td className="uppercase">{u.role || "—"}</td>
                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Botón promover: solo si rol actual es user */}
                      <button
                        className="btn btn-sm btn-secondary"
                        disabled={u.role !== "user"}
                        onClick={() => handlePromote(u._id)}
                        title={
                          u.role === "user"
                            ? "Promover a DIVULGADOR"
                            : "Solo se promueven cuentas con rol 'user'"
                        }
                      >
                        Promover a DIVULGADOR
                      </button>
                      {/* Aquí podrías agregar más acciones en el futuro */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <footer className="mt-4 flex items-center gap-2 justify-end">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
        >
          ← Anterior
        </button>
        <span className="text-sm opacity-70">
          Página {currentPage} de {totalPages} — {filtered.length} usuarios
        </span>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
        >
          Siguiente →
        </button>
      </footer>
    </main>
  );
}
