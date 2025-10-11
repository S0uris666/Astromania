import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user/UserContext";
import { PaymentButton } from "../../components/Payment/PaymentButton";
import { Link } from "react-router-dom";

// Utilidad CLP
const clp = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
    Number(n || 0)
  );

export function SuperUserPerfil() {
  const navigate = useNavigate();

  // tomamos todo del contexto de usuario
  const userCtx = useContext(UserContext);
  const {
    currentUser,
    authState,
    cart,
    logoutUser,
    removeFromCart,
    setQty,
    clearCart,
  } = userCtx || {};





  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Totales
  const subtotal = useMemo(
    () =>
      (cart || []).reduce(
        (acc, it) => acc + Number(it.price) * Number(it.quantity),
        0
      ),
    [cart]
  );

  // Pago (Mercado Pago) — items + payer
  const paymentItems = (cart || []).map((it) => ({
    title: it.title,
    price: Number(it.price),
    quantity: Number(it.quantity),
    description: it.description ?? it.title,
  }));

  const payerInfo = {
    name: currentUser?.username ?? "",
    email: currentUser?.email ?? "",
  };

  const onPaymentSuccess = () => {
    clearCart();
  };
  const onPaymentError = (err) => {
    console.error("Error en el pago:", err);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 mt-15">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          ✨ Bienvenida/o {currentUser?.username} ✨
        </h1>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil */}

        {/* Catálogo + Carrito */}
        <section className="lg:col-span-2 space-y-6">
          {/* Carrito */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Tu carrito</h2>

              {!cart?.length ? (
                <p className="opacity-70">Aún no has agregado productos.</p>
              ) : (
                <>
                  <div className="overflow-x-auto mt-2">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th className="text-right">Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((it) => (
                          <tr key={it._id}>
                            <td>{it.title}</td>
                            <td>{clp(it.price)}</td>
                            <td>
                              <input
                                type="number"
                                min={1}
                                value={it.quantity}
                                onChange={(e) => setQty(it._id, e.target.value)}
                                className="input input-bordered input-xs w-20"
                              />
                            </td>
                            <td className="text-right">
                              {clp(Number(it.price) * Number(it.quantity))}
                            </td>
                            <td className="text-right">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => removeFromCart(it._id)}
                                title="Quitar"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan={3} className="text-right">
                            Total
                          </th>
                          <th className="text-right">{clp(subtotal)}</th>
                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-4">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={clearCart}
                    >
                      Vaciar carrito
                    </button>
                    <div className="w-full sm:w-80">
                      <PaymentButton
                        items={paymentItems}
                        buttonText="Pagar con Mercado Pago"
                        className="w-full"
                        payerInfo={payerInfo}
                        onSuccess={onPaymentSuccess}
                        onError={onPaymentError}
                        disabled={!paymentItems.length}
                        requireAuth 
                        isAuthenticated={!!authState} 
                        onRequireLogin={() => navigate("/login?next=/perfil")}
                      />
                      {!authState && (
                        <p className="text-xs opacity-70 mt-2">
                          Debes{" "}
                          <a href="/login" className="link link-primary">
                            iniciar sesión
                          </a>{" "}
                          para completar el pago.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                  <Link to="/admin/eventos/editar" className="btn btn-accent">
                    Editar evento
                  </Link>
            </div>
          </div>
        </div>
        </section>
      </div>
              {authState && (
          <button
            type="button"
            onClick={handleLogout}
            className=" btn btn-secondary mt-5"
          >
            Cerrar sesión
          </button>
        )}
    </div>
  );
}
