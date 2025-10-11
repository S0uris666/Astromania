import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();



//rutas
import eventRouter from "./routes/event.route.js";
import userRouter from "./routes/user.routes.js";
import contactRouter from './routes/contact.route.js';
import paymentRouter from "./routes/payment.route.js";
import serviceProductRouter from "./routes/service.product.route.js";
import routerCloudinary from "./routes/image.route.js";


// Middlewares
app.use(cors({
  origin:["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());


// Rutas
app.get("/", (req, res) => {
  res.send("Backend funcionando!");
});

app.use('/api', contactRouter); 
app.use("/api/payments", paymentRouter);
app.use("/api", userRouter);
app.use("/api", eventRouter);
app.use("/api", serviceProductRouter)
app.use("/api", routerCloudinary);


export default app;