import { AboutData } from "../../data/AboutData";


export const AboutUs = () => {
  const { missionVision, mision, vision, team } = AboutData;

  return (
    <div className="px-6 md:px-16 py-12 bg-gray-900 text-white min-h-screen">
      {/* Misión y Visión */}
      <section className="mb-16 mt-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-secondary">
          {missionVision.title}
        </h2>
        
        {/* <p className="text-center text-gray-400 max-w-3xl mx-auto text-justify ">{missionVision.long_description}</p> */}
      </section>

      {/* Misión y Visión en tarjetas */}
      <section className="grid md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold mb-4 text-primary ">Misión</h3>
          <p className="text-gray-300 ">{mision}</p>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-2xl font-semibold mb-4 text-primary">Visión</h3>
          <p className="text-gray-300">{vision}</p>
        </div>
      </section>

      {/* Equipo */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-secondary">Nuestro Equipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-primary">{member.name}</h3>
              <p className="text-gray-400 ">{member.role}</p>
              <p className="text-gray-400 mb-2">{member.email}</p>
              <p className="text-gray-300 text-sm text-justify">{member.description}</p>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

