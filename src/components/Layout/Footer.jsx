import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-deep-space text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Sección sobre nosotros */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Astromanía</h3>
          <p className="mb-6 text-gray-400 text-sm">
            ¿Quieres llevar el universo a tu colegio o comuna? ¡Contáctanos y vivamos una experiencia astronómica única!
          </p>


           <a
              href="/reserva"
              className="w-full sm:w-auto text-center px-6 py-3 btn-galaxy hover:btn-galaxy text-white rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Reserva una visita
            </a>
        </div>

        {/* Sección enlaces rápidos */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Enlaces</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-blue-400 transition">Inicio</Link></li>
            <li><Link to="/nosotros" className="hover:text-blue-400 transition">Nosotros</Link></li>
            <li><Link to="/recursos" className="hover:text-blue-400 transition">Recursos</Link></li>
            <li><Link to="/comunidad" className="hover:text-blue-400 transition">Comunidad</Link></li>
            <li><Link to="/contacto" className="hover:text-blue-400 transition">Contacto</Link></li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
          <div className="flex justify-center md:justify-start gap-4 text-2xl text-gray-400">
            <a href="https://facebook.com/fundacionastromania" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com/fundacionastromania" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition">
              <FaYoutube />
            </a>
            
          </div>
        </div>
      </div>

      {/* Pie de página */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Astromanía. Todos los derechos reservados.
      </div>
    </footer>
  );
}