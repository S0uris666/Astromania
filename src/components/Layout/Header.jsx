import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Bloquear scroll cuando el menú esté abierto (opcional pero recomendado)
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);


  return (
    <header
      className={`fixed top-0 left-0 w-full z-[80] transition-colors duration-300 ${
    scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent"
  } text-white`}
    >
      {/* Barra móvil */}
      <div className="lg:hidden container mx-auto flex items-center justify-between h-16 px-4 relative">
        <button
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(!menuOpen)}
          className="z-[90]"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <img
          src="/vite.svg"
          alt="Astromanía Logo"
          className="h-12 w-auto z-[70]"
        />

        {/* Espaciador para balancear */}
        <div className="w-[28px]" />
      </div>

      {/* Barra escritorio */}
      <div className="hidden lg:flex container mx-auto items-center justify-between h-20 px-4">
        <div className="flex items-center space-x-3">
          <img src="/vite.svg" alt="Astromanía Logo" className="h-12 w-auto" />
        </div>

        <nav className="flex space-x-6">
          {[
            { to: "/", label: "Inicio" },
            { to: "/nosotros", label: "Nosotros" },
            { to: "/actividades-servicios", label: "Actividades y Servicios" },
            { to: "/recursos", label: "Recursos" },
            { to: "/contacto", label: "Contacto" },
            { to: "/comunidad", label: "Comunidad" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/reserva"
          className="bg-galaxy hover:bg-galaxy text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Reserva una visita
        </Link>
      </div>

      {/* OVERLAY del menú móvil (cubre la pantalla) */}
 <div
  className={`lg:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
    menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
  aria-hidden={!menuOpen}
  onClick={() => setMenuOpen(false)}
>
        {/* Contenido del menú: empieza debajo de la barra (h-16) */}
        <nav
          className="container mx-auto pt-16 px-6 space-y-6 relative z-[100]"
          // Evita que el click en los links cierre por el contenedor
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to="/"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/nosotros"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Nosotros
          </Link>
          <Link
            to="/actividades-servicios"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Actividades y Servicios
          </Link>
          <Link
            to="/recursos"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Recursos
          </Link>
          <Link
            to="/comunidad"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Comunidad
          </Link>
          <Link
            to="/contacto"
            className="block text-lg hover:text-blue-400 transition"
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </Link>
          <Link
            to="/reserva"
            className="block text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            onClick={() => setMenuOpen(false)}
          >
            Reserva una visita
          </Link>
        </nav>
      </div>
    </header>
  );
}
