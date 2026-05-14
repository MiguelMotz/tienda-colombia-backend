import { Router } from "express";
import {
  editProduct,
  getProduct,
  listProducts,
  removeProduct,
  storeProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", listProducts);
router.post("/", storeProduct);
router.get("/:id", getProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;