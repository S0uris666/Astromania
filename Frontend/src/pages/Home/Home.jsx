import { Activities } from "../../data/Activities";
import { AboutData } from "../../data/AboutData";
import { Link } from "react-router-dom";
import { Partners } from "../../data/Partners";
import { recursos } from "../../data/Recursos";
import { comunidad } from "../../data/Comunidad";
import { Redes } from "../../data/Redes";

const { team, faqs } = AboutData;
export function Home() {
  return (
    <main>
      {/* HERO / PRIMER PANTALLAZO */}
      <section className=" h-screen bg-cover bg-center flex items-center justify-start text-white relative overflow-hidden">
        {/* Fondo */}
        <div className="absolute inset-0">
          <img
            src="/public/Images/Hero.webp" // Cambia por tu imagen o video
            alt="Cielo estrellado"
            className="w-full h-full object-cover"
          />
          {/* Overlay oscuro para contraste */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Contenido */}
        <div className="relative z-10 max-w-2xl px-4 md:px-16 lg:px-24 flex flex-col justify-center h-full text-left items-start">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-in ">
            Explora el Universo con{" "}
            <span className="text-primary">Astromanía</span>
          </h1>
          <p className="text-lg md:text-2xl mb-8 animate-fade-in delay-200">
            Educación astronómica para todas las edades en Chile
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-start animate-fade-in delay-400">
            <Link
              to="/reserva"
              className="btn btn-galaxy btn-lg w-full sm:w-auto text-center px-6 py-3  text-white rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Reserva una visita
            </Link>
            <Link
              to="/actividades-servicios"
              className="btn btn-neutral btn-lg px-6 py-3 bg-transparent border border-white hover:bg-white hover:text-black rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Descubre nuestras actividades
            </Link>
          </div>
        </div>
      </section>

      {/*ACTIVIDADES DESTACADAS */}

      <section className="py-20 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary">
            Actividades destacadas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Activities.map((activity) => (
              <div
                key={activity.id}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform transition duration-500 hover:scale-105 bg-gradient-to-br from-space via-nebula to-deepSpace"
              >
                {/* Imagen de fondo con overlay y blur */}
                <div className="absolute inset-0">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover brightness-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent " />
                </div>

                {/* Contenido de la tarjeta */}
                <div className="relative p-6 flex flex-col justify-end h-80">
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {activity.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{activity.description}</p>
                  <Link
                    to={`/actividades-servicios/${activity.id}`}
                    className="btn btn-galaxy btn-lg inline-block px-5 py-3 text-white font-semibold rounded-xl shadow-lg transition transform hover:scale-105 text-center"
                  >
                    {activity.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN NOSOTROS / CREDIBILIDAD */}
      <section className="py-20 bg-deep-space text-white">
        {/* Misión y Visión */}


        {/* Equipo */}
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <h3 className="text-secondary text-2xl md:text-3xl font-bold mb-8 text-center">
            Nuestro Equipo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Link key={member.name} to="nosotros" className="card">
                <div key={member.name} className="card">
                  <div className="card-inner">
                    {/* Front */}
                    <div className="card-front">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mb-4 object-cover"
                      />
                      <h4 className="text-xl font-semibold">{member.name}</h4>
                      <p className="text-gray-400">{member.role}</p>
                    </div>
                    {/* Back */}
                    <div className="card-back">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mb-4 object-cover"
                      />
                      <h4 className="text-xl font-semibold ">{member.name}</h4>
                      <p className="text-gray-400 ">{member.email}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-5xl mx-auto px-4 mb-16">
          <h3 className="text-secondary text-2xl md:text-3xl font-bold mb-8 text-center">
            Preguntas Frecuentes
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
              >
                <summary className="font-semibold">{faq.question}</summary>
                <p className="mt-2 text-gray-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/contacto"
            className="inline-block px-6 py-3 bg-galaxy text-white rounded-lg shadow-lg
               transition-transform duration-300 transform hover:scale-105
               hover:bg-galaxy/80"
          >
            Contáctanos
          </Link>
        </div>
      </section>

      {/* SECCIÓN COLABORADORES */}
      <section className="bg-deepSpace py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-8">
            Nuestros Colaboradores
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center">
            {Partners.map((partner) => (
              <div
                key={partner.id}
                className="flex justify-center items-center bg-white/5 p-4 rounded-lg hover:scale-105 transition-transform"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-16 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* recursos */}
      <section className="py-12 px-6 text-center bg-deep-space">
        <h2 className="text-secondary text-3xl md:text-4xl font-bold mb-10 tracking-wide">
          Recursos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {recursos.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-lg shadow-purple-500/50
          hover:shadow-blue-400/70 hover:scale-105 transition-all duration-300
           bg-[#1a1a2e] text-white flex flex-col items-center justify-center"
            >
              <h3 className="text-xl font-semibold mb-4">{item.titulo}</h3>

              {/* Botón con Link */}
              <Link
                to={item.link}
                className="inline-block px-5 py-2 mt-4 bg-gray-100 text-gray-900 font-semibold rounded-xl
            shadow-md hover:bg-gray-200 transition-colors duration-300"
              >
                {item.texto}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN COMUNIDAD */}
      <section className="py-12 px-6 text-center bg-deepSpace">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-10 tracking-wide">
          Comunidad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {comunidad.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-lg shadow-blue-500/50
          hover:shadow-purple-400/70 hover:scale-105 transition-all duration-300
           bg-[#1a1a2e] text-white flex flex-col items-center justify-center"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-4 mt-2">{item.titulo}</h3>

              {/* Botón con Link */}
              <Link
                to={item.link}
                className="inline-block px-5 py-2 mt-2 bg-gray-100 text-gray-900 font-semibold rounded-xl 
            shadow-md hover:bg-gray-200 transition-colors duration-300"
              >
                {item.texto}
              </Link>
            </div>
          ))}
          {/* Redes sociales */}
          {Redes.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-lg shadow-blue-500/50
          hover:shadow-purple-400/70 hover:scale-105 transition-all duration-300
          bg-[#1a1a2e] text-white flex flex-col items-center justify-center"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-4 mt-2">{item.titulo}</h3>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 mt-2 bg-gray-100 text-gray-900 font-semibold rounded-xl 
            shadow-md hover:bg-gray-200 transition-colors duration-300"
              >
                {item.texto}
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
