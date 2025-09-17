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

  // Bloquear scroll cuando el menú esté abierto
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

        <nav className="flex space-x-6 items-center  ">
          {[
            { to: "/" , label: "Inicio" },
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
          className="btn btn-secondary btn-md text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Reserva una visita
        </Link>
      </div>
      {/* OVERLAY del menú móvil - SOLUCIÓN COMPLETA */}
      
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${
          menuOpen
            ? "opacity-100 visible bg-black/90 backdrop-blur-lg"
            : "opacity-0 invisible bg-transparent"
        }`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        {/* Botón de cerrar (X) en la parte superior derecha */}
        <button
          aria-label="Cerrar menú"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          className="absolute top-4 right-4 z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          <X size={28} className="text-white" />
        </button>

        {/* Contenido del menú */}
        <nav
          className="absolute top-16 left-0 w-full px-6 py-8 space-y-6 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to="/"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/nosotros"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Nosotros
          </Link>
          <Link
            to="/actividades-servicios"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Actividades y Servicios
          </Link>
          <Link
            to="/recursos"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Recursos
          </Link>
          <Link
            to="/comunidad"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Comunidad
          </Link>
          <Link
            to="/contacto"
            className="block text-xl font-medium hover-text-galaxy transition-colors duration-200 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </Link>
          <Link
            to="/reserva"
            className="block text-center bg-galaxy  text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 mt-6 font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Reserva una visita
          </Link>
        </nav>
      </div>
    </header>
  );
}
