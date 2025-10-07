import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingCart, Trash2 } from "lucide-react";
import { UserContext } from "../../context/user/UserContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const {
    cart = [],
    clearCart,
    removeFromCart,
    authState,
    currentUser,
  } = useContext(UserContext);

  //destino segun rol

  const accountPath = useMemo(() => {
    if (!authState) return "/login";
    const u = currentUser?.user || currentUser;
    const role = (u?.role || "user").toLowerCase();
    return role === "admin" ? "/admin" : "/perfil";
  }, [authState, currentUser]);

  const qty = useMemo(
    () => cart.reduce((acc, it) => acc + Number(it.quantity || 0), 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 0),
        0
      ),
    [cart]
  );

  const clp = (n) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(Number(n || 0));

  // scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // bloquear scroll cuando menú móvil abierto
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  // cerrar dropdown carrito al hacer click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!cartRef.current) return;
      if (!cartRef.current.contains(e.target)) setCartOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goCheckout = () => {
    setCartOpen(false);
    navigate("/perfil"); // ahí está el carrito grande y el botón de pago
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[80] transition-colors duration-300 ${
        scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent"
      } text-white`}
    >
      {/* Barra móvil */}
      <div className="lg:hidden container mx-auto flex items-center justify-between h-16 px-4 relative">
        <button
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`z-[90] transition-opacity ${
            menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* ya no alternamos a <X />, dejamos siempre el ícono de menú */}
          <Menu size={28} />
        </button>

        <img
          src="/vite.svg"
          alt="Astromanía Logo"
          className="h-12 w-auto z-[70]"
        />

        {/* Botón carrito móvil */}
        <div className="relative z-[80]" ref={cartRef}>
          <button
            aria-label="Carrito"
            className="btn btn-ghost btn-circle"
            onClick={() => setCartOpen((v) => !v)}
          >
            <div className="indicator">
              <ShoppingCart className="w-6 h-6" />
              {qty > 0 && (
                <span className="badge badge-primary badge-sm indicator-item">
                  {qty}
                </span>
              )}
            </div>
          </button>

          {/* Panel carrito móvil */}
          {cartOpen && (
            <div className="absolute right-0 mt-2 w-[90vw] max-w-sm bg-neutral text-neutral-content rounded-xl shadow-xl p-3">
              <MiniCart
                cart={cart}
                clp={clp}
                subtotal={subtotal}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                goCheckout={goCheckout}
                authState={authState}
              />
            </div>
          )}
        </div>
      </div>

      {/* Barra escritorio */}
      <div className="hidden lg:flex container mx-auto items-center justify-between h-20 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="/vite.svg" alt="Astromanía Logo" className="h-12 w-auto" />
        </div>

        {/* Menú */}
        <nav className="flex space-x-6 items-center">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>

          <div className="flex gap-4">
            <Drop label="Recursos">
              <li>
                <Link to="/recursos/literatura">Literatura Astronómica</Link>
              </li>
              <li>
                <Link to="/recursos/musica">Música Astronómica</Link>
              </li>
              <li>
                <Link to="/recursos/peliculas-series">Películas y series</Link>
              </li>
              <li>
                <Link to="/recursos/sofware-y-apps">Software y apps</Link>
              </li>
            </Drop>

            <Drop label="Comunidad">
              <li>
                <Link to="/comunidad/astromania-responde">
                  Astromanía responde
                </Link>
              </li>
              <li>
                <Link to="/comunidad/podcast">Podcast</Link>
              </li>
              <li>
                <Link to="/comunidad/galeria">Galería</Link>
              </li>
            </Drop>
          </div>

          <NavLink to="/servicios-productos-list">
            Servicios y Productos
          </NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          <NavLink to="/eventos">Eventos</NavLink>
        </nav>

        {/* Search + auth + carrito */}
        <div className="flex items-center gap-3">
          <div className="form-control">
            <input
              type="text"
              placeholder="Buscar..."
              className="input input-bordered input-sm w-48 bg-white/10 text-white placeholder-gray-300"
            />
          </div>

          <Link
            to={accountPath}
            className="btn btn-secondary btn-sm text-white"
          >
            {authState ? "Mi cuenta" : "Ingresa"}
          </Link>

          {/* Carrito escritorio */}
          <div className="relative" ref={cartRef}>
            <button
              aria-label="Carrito"
              className="btn btn-ghost btn-circle"
              onClick={() => setCartOpen((v) => !v)}
            >
              <div className="indicator">
                <ShoppingCart className="w-6 h-6" />
                {qty > 0 && (
                  <span className="badge badge-primary badge-sm indicator-item">
                    {qty}
                  </span>
                )}
              </div>
            </button>

            {cartOpen && (
              <div className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] bg-neutral text-neutral-content rounded-xl shadow-xl p-3">
                <MiniCart
                  cart={cart}
                  clp={clp}
                  subtotal={subtotal}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  goCheckout={goCheckout}
                  authState={authState}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay / menú móvil */}
      <div
        className={`lg:hidden fixed inset-0 z-[70] transition-all duration-300 ${
          menuOpen
            ? "opacity-100 visible bg-black/90 backdrop-blur-lg"
            : "opacity-0 invisible"
        }`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        <button
          aria-label="Cerrar menú"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          className="absolute top-4 left-4 z-[120] p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X size={28} className="text-white" />
        </button>

        <nav
          className="absolute top-16 left-0 w-full px-6 py-8 space-y-6 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
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

/* ---------- Subcomponentes ---------- */

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
      after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px]
      after:transition-all after:duration-300 hover:after:w-full"
    >
      {children}
    </Link>
  );
}

function Drop({ label, children }) {
  return (
    <div className="dropdown dropdown-hover group">
      <label
        tabIndex={0}
        className="relative hover-text-galaxy hover-after-galaxy transition-colors duration-300
        after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px]
        after:transition-all after:duration-300 hover:after:w-full cursor-pointer flex items-center"
      >
        {label}
        <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-300 rotate-90 group-hover:rotate-0" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-black/80 backdrop-blur-md rounded-box w-52 text-white mt-2"
      >
        {children}
      </ul>
    </div>
  );
}

function MiniCart({
  cart,
  clp,
  subtotal,
  removeFromCart,
  clearCart,
  goCheckout,
  authState,
}) {
  if (!cart?.length) {
    return <div className="p-4 text-sm opacity-80">Tu carrito está vacío.</div>;
  }

  return (
    <div className="space-y-3">
      <ul className="max-h-72 overflow-auto divide-y divide-base-300/30 pr-1">
        {cart.map((it) => (
          <li key={it._id} className="py-2 flex items-start gap-3">
            <div className="w-12 h-12 rounded bg-base-100/20 overflow-hidden flex-shrink-0">
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs opacity-60">
                  Img
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">{it.title}</div>
              <div className="text-xs opacity-70">
                {clp(it.price)} × {it.quantity}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-xs"
              title="Quitar"
              onClick={() => removeFromCart(it._id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm opacity-80">Subtotal</span>
        <span className="font-bold">{clp(subtotal)}</span>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm flex-1" onClick={clearCart}>
          Vaciar
        </button>
        <button
          className="btn btn-primary btn-sm flex-1"
          onClick={goCheckout}
          disabled={
            !authState &&
            false /* permitimos ver /perfil; pago se bloquea ahí */
          }
        >
          Ir a pagar
        </button>
      </div>
    </div>
  );
}
