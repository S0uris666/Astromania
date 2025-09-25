import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();



//controllers
import userRouter from "./routes/user.routes.js";
import contactRouter from './routes/contact.route.js';
import paymentRouter from "./routes/payment.route.js";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Rutas
app.get("/", (req, res) => {
  res.send("Backend funcionando!");
});

app.use('/api', contactRouter); 
app.use("/api/payments", paymentRouter);
app.use("/api", userRouter);


export default app;