
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

/* Conexion DB */
connectDB();

dotenv.config();

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});