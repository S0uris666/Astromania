import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import contactRouter from './routes/contact.route.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("🚀 Backend funcionando!");
});

// Rutas
app.use('/', contactRouter);



// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});