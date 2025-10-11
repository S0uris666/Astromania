import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/user/UserContext.js";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next");

  const { loginUser } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const user = await loginUser(formData);
      const role = user.role;
      if (next && !["admin", "superuser"].includes(role)) {
        navigate(next, { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "superuser") {
        navigate("/perfilsuperuser", { replace: true });
      } else {
        navigate("/perfil", { replace: true });
      }

      setStatus("¡Estas dentro!");
      setFormData({ email: "", password: "" });
      setLoading(false);
    } catch (error) {
      console.error(error);

      // si es un error del backend REVISAR
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setStatus(error.response.data.message);
      } else {
        setStatus("Error al iniciar sesión, contraseña o usuario incorrecto");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="w-full max-w-xl p-10">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Iniciar Sesión
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral shadow-xl rounded-lg p-6 space-y-4"
        >
          <div className="form-control">
            <label className="label">
              <span className="label-text">Correo electrónico</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered input-neutral w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Contraseña</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered input-neutral w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary w-full"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {status && <p className="text-center text-success mt-2">{status}</p>}

          {/* Texto para registrarse */}
          <p className="text-center mt-4 text-sm text-white">
            ¿No tienes una cuenta?{" "}
            <Link to="/registro" className="text-secondary font-semibold">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
