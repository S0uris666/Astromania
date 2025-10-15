import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceProductState from "./context/serviceProducts/ServiceProductState.jsx";
//Layout Principal
import Layout from "./components/Layout/Layout.jsx";
// Páginas
import { Home } from "./pages/Home/Home.jsx";
import { AboutUs } from "./pages/AboutUs/AboutUs.jsx";
import { ServiceProductList } from "./pages/ServiceProduct/List/ServiceProductList.jsx";
import { ServiceProductSingle } from "./pages/ServiceProduct/Single/ServiceProductSingle.jsx";
import { Recursos } from "./pages/Recursos/Recursos.jsx";
import { Comunidad } from "./pages/Comunidad/Comunidad.jsx";
import { Contacto } from "./pages/Contacto/Contacto.jsx";
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
import {AdminRoute} from "./routes/AdminRoute.jsx";
import  PerfilAdmin  from "./pages/Admin/PerfilAdmin.jsx";
import { CrearProductos } from "./pages/ServiceProduct/Crearproductos.jsx";
import { CrearEventos } from "./pages/Events/CrearEventos.jsx";
import {SuperUserRoute} from "./routes/SuperUserRoute.jsx";
import { SuperUserPerfil } from "./pages/Perfil/SuperUserPerfil.jsx";
import { AdminUsers } from "./pages/Admin/AdminUsers.jsx";
import {AdminoSuperuserRoute} from "./routes/AdminoSuperuserRoute.jsx";
import { EditarEventos } from "./pages/Events/EditarEventos.jsx";
import { Editar } from "./pages/Events/Editar.jsx";
import { EditarProductos } from "./pages/ServiceProduct/EditarProductos.jsx";
import { SeleccionProductos } from "./pages/ServiceProduct/SeleccionProductos.jsx";
import SearchResults from "./pages/SearchResults/SearchResults.jsx";
import { Literatura } from "./pages/Recursos/Literatura/Literatura.jsx";
import MusicaAstronomica from "./pages/Recursos/Musica/musica.jsx";
import { Audiovisual } from "./pages/Recursos/Audiovisual/Audiovisual.jsx";

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
                  {/* Subpaginas de recursos */}
                  {/* Literatura */}
                  <Route path="/recursos/literatura" element={<Literatura />} />
                  {/* Música */}
                  <Route path="/recursos/musica" element={<MusicaAstronomica />} />

                  {/* Peliculas */}
                   <Route path="/recursos/peliculas-series" element={<Audiovisual />} />



                  <Route path="/comunidad" element={<Comunidad />} />
                  <Route path="/contacto" element={<Contacto />} />
                  
                  {/* Rutas de Autenticación y Perfil */}
                  <Route
                    path="login"
                    element={<AuthRoute component={Login} />}
                  />
                  <Route path="/registro" element={<AuthRoute component={Registro} />} />
                  
                  <Route
                    path="perfil"
                    element={<PrivateRoute component={Perfil} />}
                  />
                  <Route path="perfilsuperuser" element={<SuperUserRoute component={SuperUserPerfil} />} />

                  <Route path="/eventos" element={<EventsCalendarPage />} />

                  {/* Rutas de Admin */}
                  <Route path="/admin/usuarios" element={<AdminRoute component={AdminUsers} />} />
                  <Route path="/admin/eventos/editar" element={<AdminoSuperuserRoute component={EditarEventos} />} />
                  <Route path="/admin/eventos/editar/:id" element={<AdminoSuperuserRoute component={Editar} />} />
                  <Route path="/admin/productos/editar/:id" element={<AdminRoute component={EditarProductos} />} />
                  <Route path="/admin/productos/seleccionar" element={<AdminRoute component={SeleccionProductos} />} />


                  <Route
                    path="/admin/productos/nuevo"
                    element={<AdminRoute component={CrearProductos} />}
                  />
                                    <Route
                    path="/admin/eventos/nuevo"
                    element={<AdminoSuperuserRoute component={CrearEventos} />}
                  />


                                    <Route
                    path="/admin"
                    element={<AdminRoute component={PerfilAdmin} />}
                  />
                  <Route path="/buscar" element={<SearchResults />} />

                  

                </Route>

                
              </Routes>
            </BrowserRouter>
          </ServiceProductState>
        </EventState>
      </PaymentProvider>
    </UserState>
  );
}
