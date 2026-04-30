import { prisma } from "../config/prisma.js";

function getReviewsStats(product) {
  const reviews = product.reviews || [];
  const reviewsCount = product._count?.reviews || reviews.length;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return {
    avgRating: Number(avgRating.toFixed(1)),
    reviewsCount,
  };
}

function normalizeProduct(product) {
  const { reviews, _count, ...productData } = product;
  const stats = getReviewsStats(product);

  return {
    ...productData,
    price: Number(productData.price),
    images: Array.isArray(productData.images) ? productData.images : [],
    avgRating: stats.avgRating,
    reviewsCount: stats.reviewsCount,
  };
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: [{ category: "asc" }, { id: "asc" }],
  });

  return products.map(normalizeProduct);
}

export async function getProductById(id) {
  const product = await prisma.product.findFirst({
    where: {
      id: Number(id),
      isActive: true,
    },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!product) return null;

  return normalizeProduct(product);
}

export async function createProduct(payload) {
  const title = payload?.title?.trim();
  const price = Number(payload?.price);
  const images = Array.isArray(payload?.images)
    ? payload.images.map((img) => img.trim()).filter(Boolean)
    : [];
  const categoryValue = payload?.category;
  const seller = payload?.seller?.trim();

  if (!title || !price || images.length === 0 || !categoryValue || !seller) {
    const error = new Error("Faltan datos obligatorios del producto");
    error.status = 400;
    throw error;
  }

  const product = await prisma.product.create({
    data: {
      title,
      price,
      stock: Number(payload.stock) || 10,
      image: images[0],
      images,
      category: categoryValue === "licores" ? "bebidas" : categoryValue,
      subcategory: categoryValue === "licores" ? "licores" : null,
      seller,
      description: payload.description?.trim() || null,
      isActive: true,
    },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  return normalizeProduct(product);
}