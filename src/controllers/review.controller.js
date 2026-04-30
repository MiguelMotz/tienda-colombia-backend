import {
  createProductReview,
  getReviewsByProduct,
  hasUserReviewedProduct,
} from "../services/review.service.js";

export async function listProductReviews(req, res, next) {
  try {
    const reviews = await getReviewsByProduct(req.params.productId);

    res.json({
      ok: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

export async function storeProductReview(req, res, next) {
  try {
    const review = await createProductReview(req.body);

    res.status(201).json({
      ok: true,
      message: "Reseña publicada correctamente",
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function checkUserReview(req, res, next) {
  try {
    const reviewed = await hasUserReviewedProduct({
      productId: req.query.productId,
      userEmail: req.query.userEmail,
    });

    res.json({
      ok: true,
      data: reviewed,
    });
  } catch (error) {
    next(error);
  }
}