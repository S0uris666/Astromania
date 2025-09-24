import express from "express";
import cors from "cors";
const app = express();


//controllers
import authRouter from "./routes/auth.routes.js";
import contactRouter from './routes/contact.route.js';
import paymentRouter from "./routes/payment.route.js";

// Middlewares
app.use(cors());
app.use(express.json());


// Rutas
app.get("/", (req, res) => {
  res.send("Backend funcionando!");
});

app.use('/api', contactRouter); 
app.use("/api/payments", paymentRouter);
app.use("/api", authRouter);


export default app;