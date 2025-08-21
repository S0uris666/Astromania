import { FaPodcast, FaQuestion, FaPhotoVideo} from "react-icons/fa";

export const comunidad = [
  {
    titulo: "Pregúntale a Astromanía",
    link: "/pregunta-astromania",
    texto: "Haz tu pregunta",
    icon: <FaQuestion size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "Podcast temporada actual",
    link: "/podcast",
    texto: "Escucha ahora",
    icon: <FaPodcast size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "Galería de eventos",
    link: "/galeria",
    texto: "Ver imágenes",
    icon: <FaPhotoVideo size={32} className="mx-auto mb-4 text-white" />,
  }

];