
import { Link } from "react-router-dom";
import { BookOpen, LibraryBig, Sparkles } from "lucide-react";


import imgAprendizaje from "../../../assets/Images/literatura/literatura_aprendizaje.jpg";
 import imgJuvenil     from "../../../assets/Images/literatura/literatura_cuentos.jpg";
 import imgNovelas     from "../../../assets/Images/literatura/literatura_novelas.jpg";


export function Literatura() {
  return (
    <main className="min-h-[calc(100vh-6rem)] bg-base-200 mt-15">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Encabezado */}
        <header className="max-w-3xl">
          <h1 className="text-3xl lg:text-5xl">Literatura</h1>
          <p className="mt-3 text-base lg:text-lg text-base-content/80">
            Recolección de algunas de las mejores novelas, cuentos infantiles,
            cómics y libros de aprendizaje, para viajar por el universo desde tu
            lugar favorito.
          </p>
        </header>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <CategoryCard
            to="/literatura/aprendizaje"
            title="Libros de aprendizaje"
            desc="Guías, divulgación y manuales para comprender el cosmos paso a paso."
            icon={<BookOpen className="w-6 h-6" />}
            img={imgAprendizaje}
            gradient="from-indigo-500/25 to-indigo-700/25"
            cta="Explorar"
          />

           <CategoryCard
            to="/literatura/juvenil-cuentos"
            title="Juvenil y cuentos"
            desc="Cuentos, álbumes ilustrados y relatos para despertar la curiosidad."
            icon={<Sparkles className="w-6 h-6" />}
            img={imgJuvenil}
            gradient="from-pink-500/25 to-fuchsia-700/25"
            cta="Ver colecciones"
          />

          <CategoryCard
            to="/literatura/novelas-textos"
            title="Novelas y textos"
            desc="Clásicos y contemporáneos de ciencia ficción, space opera y más."
            icon={<LibraryBig className="w-6 h-6" />}
            img={imgNovelas}
            gradient="from-emerald-500/25 to-teal-700/25"
            cta="Descubrir"
          />  
        </div>
      </section>
    </main>
  );
}

/* ------- Subcomponente ------- */
function CategoryCard({ to, title, desc, icon, img, gradient, cta }) {
  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* Cover con overlay */}
      <figure className="relative h-40 sm:h-48">
        <img
          src={img}
          alt="" /* decorativa */
          className="w-full h-full object-cover opacity-90 group-hover:opacity-95 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      </figure>

      {/* Contenido */}
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div className="btn btn-circle btn-ghost btn-sm text-primary bg-primary/10 border-none">
            {icon}
          </div>
          <h3 className="card-title text-lg sm:text-xl">{title}</h3>
        </div>

        <p className="mt-2 text-sm sm:text-base text-base-content/80">{desc}</p>

        <div className="card-actions mt-4">
          <Link
            to={to}
            className="btn btn-primary btn-sm sm:btn-md normal-case"
            aria-label={`${cta} ${title}`}
            title={title}
          >
            {cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
