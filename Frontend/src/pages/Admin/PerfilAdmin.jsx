import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user/UserContext";

export default function PerfilAdmin() {
  const { currentUser, logoutUser, authState } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="mt-15 flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <div className="sm:ml-auto text-base-content/70">
          Hola, <span className="font-semibold">{currentUser?.username || "Admin"}</span>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Actividades</h2>
              <span className="badge badge-primary">Recursos</span>
            </div>
            <p className="text-sm text-base-content/70">
              Crea y gestiona productos, servicios o actividades con toda la información necesaria para el catálogo público.
            </p>
            <div className="card-actions justify-end flex-wrap gap-2">
              <Link
                to="/admin/productos/nuevo"
                className="btn btn-primary"
              >
                Nuevo elemento
              </Link>
              <Link
                to="/admin/productos/seleccionar"
                className="btn btn-primary btn-outline"
              >
                Administrar catálogo
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Eventos</h2>
              <span className="badge">Agenda</span>
            </div>
            <p className="text-sm text-base-content/70">
              Programa actividades con fecha, ubicación, aforo e inscripción para la comunidad.
            </p>
            <div className="card-actions justify-end flex-wrap gap-2">
              <Link to="/admin/eventos/nuevo" className="btn btn-accent">
                Nuevo evento
              </Link>
              <Link to="/admin/eventos/editar" className="btn btn-accent btn-outline">
                Administrar
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Usuarios</h2>
              <span className="badge badge-secondary">Roles</span>
            </div>
            <p className="text-sm text-base-content/70">
              Revisa el listado y administra los roles de los usuarios de la plataforma.
            </p>
            <div className="card-actions justify-end">
              <Link to="/admin/usuarios" className="btn btn-secondary">
                Gestionar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {authState && (
        <button type="button" onClick={handleLogout} className="btn btn-secondary">
          Cerrar sesión
        </button>
      )}
    </main>
  );
}
