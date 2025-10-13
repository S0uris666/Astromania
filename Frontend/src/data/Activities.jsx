import planetarioImg from "../assets/Images/planetario.webp";
import juegosMesaImg from "../assets/Images/juegosdemesa.webp";
import misionLunaMarteImg from "../assets/Images/misionlunamarte.webp";
import concursosImg from "../assets/Images/concursos.webp";
import cuentosImg from "../assets/Images/cuentos.webp";
import charlasTalleresImg from "../assets/Images/charlasytalleres.webp";

export const Activities = [
  {
    id: "reserva",
    linkTo:"contacto",
    title: "Visitas a colegios",
    cta: "Revisa disponibilidad",
    image: planetarioImg,
    description: "Llevamos la astronomía a tu colegio con actividades interactivas."
  },
   {
    id: "juegos-mesa",
    title: "Juegos de mesa",
    linkTo:"servicios-productos-list",
    cta: "Descubre nuestros juegos",
    image: juegosMesaImg,
    description: "Juegos originales de la fundación para aprender jugando."
  },
  
  {
    id: "luna-marte",
    title: "Exposición Misión Luna-Marte",
    linkTo:"servicios-productos-list",
    cta: "Explora la exposición",
    image: misionLunaMarteImg,
    description: "Conoce la historia y los secretos de la Luna y Marte."
  },
  {
    id: "concursos",
    title: "Concursos",
    linkTo:"servicios-productos-list",
    cta: "Participa aquí",
    image: concursosImg,
    description: "Participa en nuestros concursos astronómicos y gana premios."
  },
  {
    id: "cuentos",
    title: "Cuentos Astronómicos",
    linkTo:"servicios-productos-list",
    cta: "Descubre Cosmocuentos",
    image: cuentosImg,
    description: "Aprende astronomía de manera divertida con cuentos"
  },
  {
    id: "charlas-talleres",
    title: "Charlas y Talleres",
    linkTo:"servicios-productos-list",
    cta: "Solicita información",
    image: charlasTalleresImg,
    description: "Llevamos charlas y talleres a tu institucion."
  }
   
];