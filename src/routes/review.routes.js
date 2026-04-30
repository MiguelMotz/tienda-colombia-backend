import { Router } from "express";
import {
  checkUserReview,
  listProductReviews,
  storeProductReview,
} from "../controllers/review.controller.js";

const router = Router();

router.get("/product/:productId", listProductReviews);
router.get("/has-reviewed", checkUserReview);
router.post("/", storeProductReview);

export default router;