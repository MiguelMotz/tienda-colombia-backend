import { prisma } from "../config/prisma.js";

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

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

function productInclude() {
  return {
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
  };
}

export async function getAllProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude(),
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
    include: productInclude(),
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
    throw createHttpError("Faltan datos obligatorios del producto", 400);
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
    include: productInclude(),
  });

  return normalizeProduct(product);
}

export async function updateProduct(id, payload) {
  const productId = Number(id);
  const seller = payload?.seller?.trim();

  if (!productId || !seller) {
    throw createHttpError("Datos inválidos para editar el producto", 400);
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!existingProduct) {
    throw createHttpError("Producto no encontrado", 404);
  }

  if (existingProduct.seller !== seller) {
    throw createHttpError("No tienes permiso para editar este producto", 403);
  }

  const title = payload?.title?.trim();
  const price = Number(payload?.price);
  const images = Array.isArray(payload?.images)
    ? payload.images.map((img) => img.trim()).filter(Boolean)
    : [];
  const categoryValue = payload?.category;
  const stock = Number(payload?.stock);

  if (!title || !price || images.length === 0 || !categoryValue) {
    throw createHttpError("Faltan datos obligatorios del producto", 400);
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      title,
      price,
      stock: Number.isNaN(stock) ? existingProduct.stock : stock,
      image: images[0],
      images,
      category: categoryValue === "licores" ? "bebidas" : categoryValue,
      subcategory: categoryValue === "licores" ? "licores" : null,
      description: payload.description?.trim() || null,
    },
    include: productInclude(),
  });

  return normalizeProduct(updatedProduct);
}

export async function deleteProduct(id, payload) {
  const productId = Number(id);
  const seller = payload?.seller?.trim();

  if (!productId || !seller) {
    throw createHttpError("Datos inválidos para eliminar el producto", 400);
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!existingProduct) {
    throw createHttpError("Producto no encontrado", 404);
  }

  if (existingProduct.seller !== seller) {
    throw createHttpError("No tienes permiso para eliminar este producto", 403);
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      isActive: false,
    },
  });

  return { id: productId };
}