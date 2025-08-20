/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores astronómicos
        space: "#0b0f19",        // Fondo principal
        deepSpace: "#0f172a",    // Secciones más oscuras
        nebula: "#1e293b",       // Tonos intermedios
        star: "#facc15",         // Amarillo estrella
        comet: "#38bdf8",        // Azul brillante
        galaxy: "#9333ea",       // Morado galaxia
        meteor: "#f43f5e",       // Rojo meteoro

        // Botones
        primary: "#1e3a8a",      // Azul principal
        secondary: "#2563eb",    // Azul secundario
        accent: "#f59e0b",       // Amarillo acento
      },
    },
  },
  plugins: [],
}