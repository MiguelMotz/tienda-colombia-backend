import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes/index.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);

  const status = err.status || 500;

  res.status(status).json({
    ok: false,
    message: err.message || "Error interno del servidor"
  });
});

export default app;