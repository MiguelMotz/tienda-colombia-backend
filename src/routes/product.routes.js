import { Router } from "express";
import {
  getProduct,
  listProducts,
  storeProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", storeProduct);

export default router;