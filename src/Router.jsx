import { BrowserRouter, Routes, Route } from 'react-router-dom';


//Layout Principal
import Layout from './components/Layout/Layout.jsx';

// Páginas principales
import {Home} from './pages/Home/Home.jsx';
import {AboutUs} from './pages/AboutUs/AboutUs.jsx';
import {ActividadesServicios} from './pages/ActividadesServicios/ActividadesServicios.jsx';
import {Recursos} from './pages/Recursos/Recursos.jsx';
import {Comunidad} from './pages/Comunidad/Comunidad.jsx';
import { Contacto } from './pages/Contacto/Contacto.jsx';
import { Reserva } from './pages/Reserva/Reserva.jsx';

// Subpáginas "Nosotros"
// Subpáginas "Actividades y Servicios"
// Subpáginas "Recursos"
// Subpáginas "Comunidad"



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} >
        <Route index element={<Home />} />
        <Route path="/nosotros" element={<AboutUs />} />
        <Route path="/actividades-servicios" element={<ActividadesServicios />} />
        <Route path="/recursos" element={<Recursos />} />
       <Route path="/comunidad" element={<Comunidad />} />
       <Route path="/contacto" element={<Contacto />} />
       <Route path="/reserva" element={<Reserva />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}