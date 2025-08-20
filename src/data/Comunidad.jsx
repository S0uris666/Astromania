import { FaInstagram, FaFacebook, FaYoutube, FaPodcast, FaQuestion, FaPhotoVideo, FaUsers} from "react-icons/fa";

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
    titulo: "Instagram",
    link: "https://instagram.com/fundacionastromania",
    texto: "Visítanos",
    icon: <FaInstagram size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "Facebook",
    link: "https://facebook.com/fundacionastromania",
    texto: "Visítanos",
    icon: <FaFacebook size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "YouTube",
    link: "https://youtube.com/tu_cuenta",
    texto: "Mira ahora",
    icon: <FaYoutube size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "Galería de eventos",
    link: "/galeria",
    texto: "Ver imágenes",
    icon: <FaPhotoVideo size={32} className="mx-auto mb-4 text-white" />,
  },
  {
    titulo: "Únete a la comunidad",
    link: "/unete",
    texto: "Únete ahora",
    icon: <FaUsers size={32} className="mx-auto mb-4 text-white" />,
  },
];