import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ServiceProductState from './context/serviceProducts/ServiceProductState.jsx';


//Layout Principal
import Layout from './components/Layout/Layout.jsx';

// Páginas principales
import {Home} from './pages/Home/Home.jsx';
import {AboutUs} from './pages/AboutUs/AboutUs.jsx';
import {ServiciosProductos} from './pages/ServiciosProductos/ServiciosProductos.jsx';
import {Recursos} from './pages/Recursos/Recursos.jsx';
import {Comunidad} from './pages/Comunidad/Comunidad.jsx';
import { Contacto } from './pages/Contacto/Contacto.jsx';
import { Reserva } from './pages/Reserva/Reserva.jsx';
import {ScrollToTop} from "./components/ScrollToTop.jsx"; 
import { Login } from './pages/Login/Login.jsx';
import { Registro } from './pages/Registro/Registro.jsx';

// Subpáginas "Nosotros"
// Subpáginas "Actividades y Servicios"
// Subpáginas "Recursos"
// Subpáginas "Comunidad"



export default function AppRouter() {
  return (
    <ServiceProductState> {/* //arbol de componenete DB */}
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />} >
        <Route index element={<Home />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/servicios-productos" element={<ServiciosProductos />} />
        <Route path="/recursos" element={<Recursos />} />
       <Route path="/comunidad" element={<Comunidad />} />
       <Route path="/contacto" element={<Contacto />} />
       <Route path="/reserva" element={<Reserva />} />
       <Route path="/login" element={<Login />} />
       <Route path="/registro" element={<Registro />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ServiceProductState>
  );
}
