import { useEffect, useMemo, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingCart, Trash2 } from "lucide-react";
import { UserContext } from "../../context/user/UserContext";
import logoImg from "../../assets/Images/logo.png";

/* ---------- Logo (evita estiramiento) ---------- */
function Logo({ className = "", onClick }) {
  return (
    <Link
      to="/"
      className={`site-logo block ${className}`}
      onClick={onClick}
      aria-label="Ir al inicio"
    >
      <img
        src={logoImg}
        alt="Astromanía"
        className="h-10 sm:h-10 lg:h-12 w-auto object-contain shrink-0 select-none"
        loading="eager"
        decoding="async"
        draggable="false"
      />
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRefMobile = useRef(null);
  const cartRefDesktop = useRef(null);
  const navigate = useNavigate();

  const {
    cart = [],
    clearCart,
    removeFromCart,
    authState,
    currentUser,
  } = useContext(UserContext);

  const accountPath = useMemo(() => {
    if (!authState) return "/login";
    const u = currentUser?.user ?? currentUser;
    const role = String(u?.role || "").toLowerCase().trim();
    if (role === "admin") return "/admin";
    if (role === "superuser") return "/perfilsuperuser";
    return "/perfil";
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
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(Number(n || 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  useEffect(() => {
    const onClick = (e) => {
      const target = e.target;
      const insideMobile = cartRefMobile.current?.contains(target);
      const insideDesktop = cartRefDesktop.current?.contains(target);
      if (!insideMobile && !insideDesktop) setCartOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goCheckout = () => {
    setCartOpen(false);
    navigate("/perfil");
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[80] transition-colors duration-300 ${
        scrolled ? "bg-black/60 backdrop-blur-md" : "bg-transparent"
      } text-white`}
    >
      <style>{`
        /* Evita que utilidades y logo se encojan demasiado */
        .hdr-logo, .hdr-utils { flex-shrink: 0; }
        .site-logo img { width: auto !important; height: auto; max-height: 3rem; }
        @media (min-width: 1024px) { .site-logo img { max-height: 3rem; } }
      `}</style>

      {/* ===== Barra móvil ===== */}
      <div className="lg:hidden container mx-auto h-16 px-4 relative grid grid-cols-[auto_1fr_auto] items-center">
        {/* Menú */}
        <button
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`transition-opacity ${menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <Menu size={28} />
        </button>

        {/* Logo centrado */}
        <Logo className="justify-self-center" onClick={() => setMenuOpen(false)} />

        {/* Carrito móvil */}
        <div className="relative justify-self-end" ref={cartRefMobile}>
          <button
            aria-label="Carrito"
            className="btn btn-ghost btn-circle"
            onClick={() => setCartOpen((v) => !v)}
          >
            <div className="indicator">
              <ShoppingCart className="w-6 h-6" />
              {qty > 0 && (
                <span className="badge badge-primary badge-sm indicator-item">{qty}</span>
              )}
            </div>
          </button>

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

      {/* ===== Barra escritorio (grid 3 columnas, gaps y wrap) ===== */}
      <div
        className="hidden lg:grid w-full mx-auto max-w-screen-2xl items-center
                   grid-cols-[auto_minmax(0,1fr)_auto]
                   h-20 px-4 sm:px-6 lg:px-8 gap-4 xl:gap-6"
      >
        {/* Logo */}
        <div className="hdr-logo flex items-center mr-2 xl:mr-4">
          <Logo />
        </div>

        {/* Nav con wrap y gaps para no pegarse */}
        <nav className="flex flex-wrap items-center justify-center
                        gap-x-4 xl:gap-x-6 gap-y-2 text-[0.95rem]">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/nosotros">Nosotros</NavLink>

          <div className="flex flex-wrap items-center gap-x-4 xl:gap-x-6 gap-y-2">
            <Drop label="Recursos">
              <li><Link to="/recursos/literatura">Literatura Astronómica</Link></li>
              <li><Link to="/recursos/musica">Música Astronómica</Link></li>
              <li><Link to="/recursos/peliculas-series">Películas y series</Link></li>
              <li><Link to="/recursos/sofware-y-apps">Software y apps</Link></li>
            </Drop>

            <Drop label="Comunidad">
              <li><Link to="/comunidad/astromania-responde">Astromanía responde</Link></li>
              <li><Link to="/comunidad/podcast">Podcast</Link></li>
              <li><Link to="/comunidad/galeria">Galería</Link></li>
            </Drop>

            <NavLink to="/servicios-productos-list">Servicios y Productos</NavLink>
            <NavLink to="/contacto">Contacto</NavLink>
            <NavLink to="/eventos">Eventos</NavLink>
          </div>
        </nav>

        {/* Utilidades: búsqueda + auth + carrito */}
        <div className="hdr-utils flex items-center gap-2 md:gap-3">
          <div className="form-control">
            <input
              type="text"
              placeholder="Buscar..."
              className="input input-bordered input-sm
                         w-36 md:w-44 lg:w-48 xl:w-56 2xl:w-64
                         min-w-[9rem]
                         bg-white/10 text-white placeholder-gray-300"
            />
          </div>

          <Link to={accountPath} className="btn btn-secondary btn-sm text-white whitespace-nowrap">
            {authState ? "Mi cuenta" : "Ingresa"}
          </Link>

          <div className="relative" ref={cartRefDesktop}>
            <button
              aria-label="Carrito"
              className="btn btn-ghost btn-circle"
              onClick={() => setCartOpen((v) => !v)}
            >
              <div className="indicator">
                <ShoppingCart className="w-6 h-6" />
                {qty > 0 && (
                  <span className="badge badge-primary badge-sm indicator-item">{qty}</span>
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

      {/* ===== Overlay / menú móvil ===== */}
      <div
        className={`lg:hidden fixed inset-0 z-[70] transition-all duration-300 ${
          menuOpen ? "opacity-100 visible bg-black/90 backdrop-blur-lg" : "opacity-0 invisible"
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

          <Link to="/" className="block text-xl" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/nosotros" className="block text-xl" onClick={() => setMenuOpen(false)}>Nosotros</Link>
          <Link to="/servicios-productos-list" className="block text-xl" onClick={() => setMenuOpen(false)}>Servicios y Productos</Link>
          <Link to="/recursos" className="block text-xl" onClick={() => setMenuOpen(false)}>Recursos</Link>
          <Link to="/comunidad" className="block text-xl" onClick={() => setMenuOpen(false)}>Comunidad</Link>
          <Link to="/contacto" className="block text-xl" onClick={() => setMenuOpen(false)}>Contacto</Link>
          <Link to="/eventos" className="block text-xl" onClick={() => setMenuOpen(false)}>Eventos</Link>

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="btn btn-secondary w-full sm:w-auto inline-flex items-center justify-center mt-6 px-6 py-3
                       text-base font-semibold normal-case tracking-wide leading-tight text-white
                       shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2
                       focus-visible:ring-secondary focus-visible:ring-offset-2"
            aria-label="Inicia sesión"
            title="Inicia sesión"
          >
            Inicia sesión
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
  const getThumb = (it) => {
    const img = it.image;
    if (typeof img === "string") return img;
    if (img && typeof img === "object") {
      return img.url || img.secure_url || img.public_id || null;
    }
    const first = Array.isArray(it.images) ? it.images[0] : null;
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return first.url || first.secure_url || null;
    return it.thumbnail || it.cover || it.media?.[0]?.url || it.photo || null;
  };

  const getKey = (it) => it._id || it.id || `${it.title}-${it.variant || ""}`;

  if (!cart?.length) {
    return <div className="p-4 text-sm opacity-80">Tu carrito está vacío.</div>;
  }

  return (
    <div className="space-y-3">
      <ul className="max-h-72 overflow-auto divide-y divide-base-300/30 pr-1">
        {cart.map((it) => {
          const thumb = getThumb(it);
          return (
            <li key={getKey(it)} className="py-2 flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-base-300/50 bg-base-100/30 flex-shrink-0">
                {thumb ? (
                  <img src={thumb} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-[10px] uppercase tracking-wide opacity-60">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium leading-tight truncate">{it.title}</div>
                <div className="text-xs opacity-70">
                  {clp(it.price)} × {it.quantity}
                </div>
              </div>

              <button
                className="btn btn-ghost btn-xs"
                title="Quitar"
                onClick={() => removeFromCart(it._id || it.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
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
          disabled={!authState && false}
        >
          Ir a pagar
        </button>
      </div>
    </div>
  );
}
