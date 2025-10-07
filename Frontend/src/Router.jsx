import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceProductState from "./context/serviceProducts/ServiceProductState.jsx";

//Layout Principal
import Layout from "./components/Layout/Layout.jsx";

// Páginas principales
import { Home } from "./pages/Home/Home.jsx";
import { AboutUs } from "./pages/AboutUs/AboutUs.jsx";
import { ServiceProductList } from "./pages/ServiceProduct/List/ServiceProductList.jsx";
import { ServiceProductSingle } from "./pages/ServiceProduct/Single/ServiceProductSingle.jsx";
import { Recursos } from "./pages/Recursos/Recursos.jsx";
import { Comunidad } from "./pages/Comunidad/Comunidad.jsx";
import { Contacto } from "./pages/Contacto/Contacto.jsx";
import { Reserva } from "./pages/Reserva/Reserva.jsx";
import { ScrollToTop } from "./components/ScrollToTop.jsx";
import { Login } from "./pages/Login/Login.jsx";
import { Registro } from "./pages/Registro/Registro.jsx";
import UserState from "./context/user/UserState.jsx";
import { EventsCalendarPage } from "./pages/Events/Events.jsx";
import EventState from "./context/events/eventsState.jsx";
import PaymentProvider from "./context/payment/paymentState.jsx";
import { Perfil } from "./pages/Perfil/Perfil.jsx";
import PrivateRoute from "./routes/Private.jsx";
import AuthRoute from "./routes/Auth.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import  PerfilAdmin  from "./pages/Admin/PerfilAdmin.jsx";
import { CrearProductos } from "./pages/Admin/Crearproductos.jsx";
import { CrearEventos } from "./pages/Admin/CrearEventos.jsx";
// Subpáginas "Nosotros"
// Subpáginas "Actividades y Servicios"
// Subpáginas "Recursos"
// Subpáginas "Comunidad"

export default function AppRouter() {
  return (
    <UserState>
      <PaymentProvider>
        <EventState>
          <ServiceProductState>
            {" "}
            {/* //arbol de componenete DB */}
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/nosotros" element={<AboutUs />} />
                  <Route
                    path="/servicios-productos-list"
                    element={<ServiceProductList />}
                  />
                  <Route
                    path="/servicios-productos/:id"
                    element={<ServiceProductSingle />}
                  />
                  <Route path="/recursos" element={<Recursos />} />
                  <Route path="/comunidad" element={<Comunidad />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/reserva" element={<Reserva />} />
                  <Route
                    path="login"
                    element={<AuthRoute component={Login} />}
                  />
                  <Route path="/registro" element={<Registro />} />
                  <Route
                    path="perfil"
                    element={<PrivateRoute component={Perfil} />}
                  />
                  <Route path="/eventos" element={<EventsCalendarPage />} />

                  <Route
                    path="/admin/productos/nuevo"
                    element={<AdminRoute component={CrearProductos} />}
                  />
                                    <Route
                    path="/admin/eventos/nuevo"
                    element={<AdminRoute component={CrearEventos} />}
                  />
                                    <Route
                    path="/admin"
                    element={<AdminRoute component={PerfilAdmin} />}
                  />
                </Route>
              </Routes>
            </BrowserRouter>
          </ServiceProductState>
        </EventState>
      </PaymentProvider>
    </UserState>
  );
}
