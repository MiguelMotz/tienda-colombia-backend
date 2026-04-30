import { Router } from "express";
import productRoutes from "./product.routes.js";
import authRoutes from "./auth.routes.js";
import orderRoutes from "./order.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API de Kafira funcionando correctamente",
  });
});

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Servidor activo",
    timestamp: new Date().toISOString(),
  });
});

router.use("/products", productRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);

export default router;