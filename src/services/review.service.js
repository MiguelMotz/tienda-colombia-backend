import { prisma } from "../config/prisma.js";

function normalizeReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    productId: review.productId,
    userId: review.userId,
    userEmail: review.user.email,
    userName: review.user.name,
    createdAt: review.createdAt,
  };
}

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function getReviewsByProduct(productId) {
  const reviews = await prisma.review.findMany({
    where: {
      productId: Number(productId),
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews.map(normalizeReview);
}

export async function createProductReview(payload) {
  const productId = Number(payload?.productId);
  const rating = Number(payload?.rating);
  const comment = payload?.comment?.trim();
  const userEmail = payload?.userEmail?.trim().toLowerCase();

  if (!productId || !rating || !comment || !userEmail) {
    throw createHttpError("Faltan datos obligatorios para la reseña", 400);
  }

  if (rating < 1 || rating > 5) {
    throw createHttpError("La calificación debe estar entre 1 y 5", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw createHttpError("Usuario no encontrado", 404);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw createHttpError("Producto no encontrado", 404);
  }

  const alreadyReviewed = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (alreadyReviewed) {
    throw createHttpError("Ya dejaste una reseña sobre este producto", 409);
  }

  const purchasedProduct = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: user.id,
      },
    },
  });

  if (!purchasedProduct) {
    throw createHttpError("Solo puedes opinar productos que hayas comprado", 403);
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId: user.id,
      productId,
    },
    include: {
      user: true,
    },
  });

  return normalizeReview(review);
}

export async function hasUserReviewedProduct({ productId, userEmail }) {
  if (!productId || !userEmail) return false;

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail.trim().toLowerCase(),
    },
  });

  if (!user) return false;

  const review = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: Number(productId),
      },
    },
  });

  return Boolean(review);
}