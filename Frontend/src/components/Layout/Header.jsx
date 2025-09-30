import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

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

        {/* Espaciador */}
        <div className="w-[28px]" />
      </div>

      {/* Barra escritorio */}
      <div className="hidden lg:flex container mx-auto items-center justify-between h-20 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/vite.svg" alt="Astromanía Logo" className="h-12 w-auto" />
        </div>

        {/* Menú */}
        <nav className="flex space-x-6 items-center ">
          <Link
            to="/"
            className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
          >
            Inicio
          </Link>
          <Link
            to="/nosotros"
            className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
          >
            Nosotros
          </Link>

          <div className="flex gap-4">
            {/* Dropdown Recursos */}
            <div className="dropdown dropdown-hover group">
              <label
                tabIndex={0}
                className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full cursor-pointer flex justify-between items-center"
              >
                Recursos
                <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300 rotate-90 group-hover:rotate-0" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-black/80 backdrop-blur-md rounded-box w-52 text-white mt-2"
              >
                <li>
                  <Link to="/recursos/literatura">Literatura Astronómica</Link>
                </li>
                <li>
                  <Link to="/recursos/musica">Música Astronómica</Link>
                </li>
                <li>
                  <Link to="/recursos/peliculas-series">
                    Películas y series
                  </Link>
                </li>
                <li>
                  <Link to="/recursos/sofware-y-apps">Software y apps</Link>
                </li>
              </ul>
            </div>

            {/* Dropdown Comunidad */}
            <div className="dropdown dropdown-hover group">
              <label
                tabIndex={0}
                className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full cursor-pointer flex justify-between items-center"
              >
                Comunidad
                <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300 rotate-90 group-hover:rotate-0" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-black/80 backdrop-blur-md rounded-box w-52 text-white mt-2"
              >
                <li>
                  <Link to="/comunidad/astromania-responde">
                    Astromania responde
                  </Link>
                </li>
                <li>
                  <Link to="/comunidad/podcast">Podcast</Link>
                </li>
                <li>
                  <Link to="/comunidad/galeria">Galería</Link>
                </li>
              </ul>
            </div>
          </div>
          <Link
            to="/servicios-productos-list"
            className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
          >
            Servicios y Productos
          </Link>
          <Link
            to="/contacto"
            className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
          >
            Contacto
          </Link>
                    <Link
            to="/eventos"
            className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
             after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full"
          >
            Eventos
          </Link>
        </nav>

        {/* Barra búsqueda + botón */}
        <div className="flex items-center space-x-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Buscar..."
              className="input input-bordered input-sm w-48 bg-white/10 text-white placeholder-gray-300"
            />
          </div>

          <Link
            to="/login"
            className="btn btn-secondary btn-sm text-white px-4 py-2 rounded-lg shadow-md"
          >
            Ingresa
          </Link>
        </div>
      </div>

      {/* Overlay del menú móvil */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${
          menuOpen
            ? "opacity-100 visible bg-black/90 backdrop-blur-lg"
            : "opacity-0 invisible bg-transparent"
        }`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        {/* Botón cerrar */}
        <button
          aria-label="Cerrar menú"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          className="absolute top-4 right-4 z-[110] p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X size={28} className="text-white" />
        </button>

        {/* Menú móvil */}
        <nav
          className="absolute top-16 left-0 w-full px-6 py-8 space-y-6 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra búsqueda móvil */}
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Buscar..."
              className="input input-bordered w-full bg-white/10 text-white placeholder-gray-300"
            />
          </div>

          <Link
            to="/"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/nosotros"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Nosotros
          </Link>
          <Link
            to="/servicios-productos-list"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Servicios y Productos
          </Link>
          <Link
            to="/recursos"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Recursos
          </Link>
          <Link
            to="/comunidad"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Comunidad
          </Link>
          <Link
            to="/contacto"
            className="block text-xl"
            onClick={() => setMenuOpen(false)}
          >
            Contacto
          </Link>

          <Link
            to="/reserva"
            className="block text-center btn btn-secondary text-white mt-6"
            onClick={() => setMenuOpen(false)}
          >
            Reserva una visita
          </Link>
        </nav>
      </div>
    </header>
  );
}
