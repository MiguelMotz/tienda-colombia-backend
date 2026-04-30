import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Base de datos conectada correctamente");

    app.listen(env.port, () => {
      console.log(`Servidor backend corriendo en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();