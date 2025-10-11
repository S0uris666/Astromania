import { Activities } from "../../data/Activities";
import { AboutData } from "../../data/AboutData";
import { Link } from "react-router-dom";
import { Partners } from "../../data/Partners";



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
              to="/contacto"
              className="btn btn-galaxy btn-lg w-full sm:w-auto text-center px-6 py-3  text-white rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Reserva una visita
            </Link>
            <Link
              to="/eventos"
              className="btn btn-neutral btn-lg px-6 py-3 bg-transparent border border-white hover:bg-white hover:text-black rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Descubre actividades Astronómicas
            </Link>
          </div>
        </div>
      </section>

      {/*ACTIVIDADES DESTACADAS */}

      <section className="py-20 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 ">
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
                    to={`/${activity.linkTo}`}
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
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
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
          <h3 className=" text-2xl md:text-3xl font-bold mb-8 text-center">
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
      <section className="bg-base py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold  text-white mb-12">Nuestros Colaboradores</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {Partners.map((partner) => (
              <div
                key={partner.id}
                className="flex justify-center items-center"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      
        
      

    



    </main>
  );
}
