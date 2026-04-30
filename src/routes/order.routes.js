import { Router } from "express";
import {
  storeOrder,
  myOrders,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", storeOrder);
router.get("/my", myOrders);

export default router;