import React from 'react'

export  function Comunidad() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure>
          <img
            src="https://picsum.photos/400/200"
            alt="Random"
            className="rounded-t-xl"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">
            Bienvenido 🚀
            <div className="badge badge-secondary">Nuevo</div>
          </h2>
          <p>Este es un componente de prueba con DaisyUI + TailwindCSS 🎨</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Aceptar</button>
            <button className="btn btn-outline">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
