import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/user/UserContext.js";


export function Registro() {
  const {registerUser} = useUser();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setStatus("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
     
        setStatus("¡Registro exitoso!");
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        setLoading(false);
      
    } catch (error) {
  console.error(error);

  // si es un error del backend REVISAR!!
  if (error.response && error.response.data && error.response.data.message) {
    setStatus(error.response.data.message);
  } else {
    setStatus("Error al registrarse, intenta de nuevo");
  }
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="w-full max-w-xl p-10">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Crear Cuenta
        </h2>

        <form onSubmit={handleSubmit} className="bg-neutral shadow-xl rounded-lg p-6 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Tu nombre de usuario"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered input-neutral w-full"
              required
            />
          </div>

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

          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirmar Contraseña</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
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
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          {status && <p className="text-center text-success mt-2">{status}</p>}

          <p className="text-center mt-4 text-sm text-white">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-secondary font-semibold">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}