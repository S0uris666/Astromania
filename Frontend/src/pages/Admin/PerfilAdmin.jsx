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
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };


  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mt-15 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="sm:ml-auto text-base-content/70">
          Hola, <span className="font-semibold">{currentUser?.username || "Admin"}</span>
        </div>
      </header>

      {/* Acciones principales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Crear Producto */}
        <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Crear Producto o Servicio</h2>
              <span className="badge badge-primary">Tienda</span>
            </div>
            <p className="text-sm text-base-content/70">
              Publica un nuevo artículo físico o digital con precio, stock e imágenes.
            </p>
            <div className="card-actions justify-end">
              <Link
                to="/admin/productos/nuevo"
                className="btn btn-primary"
                state={{ presetType: "product" }}
              >
                Nuevo 
              </Link>
            </div>
          </div>
        </div>

        


        {/* Crear Evento */}
        <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Crear Evento</h2>
              <span className="badge">Eventos</span>
            </div>
            <p className="text-sm text-base-content/70">
              Agenda actividades con fecha, lugar, aforo, inscripción y estado.
            </p>
            <div className="card-actions justify-end">
              <Link to="/admin/eventos/nuevo" className="btn btn-accent">
                Nuevo evento
              </Link>
            </div>
          </div>
        </div>
      </section>
                    {authState && (
          <button
            type="button"
            onClick={handleLogout}
            className=" btn btn-secondary mt-5"
          >
            Cerrar sesión
          </button>
        )}
    </main>
  );
}
