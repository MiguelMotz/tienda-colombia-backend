import { prisma } from "../config/prisma.js";

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    subcategory: product.subcategory || "",
    price: Number(product.price),
    stock: product.stock,
    isActive: product.isActive,
    createdAt: product.createdAt
  };
}

function normalizeOrderItem(item) {
  return {
    orderId: item.order.id,
    orderItemId: item.id,
    productId: item.productId,
    productTitle: item.productTitleSnapshot,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.unitPrice) * item.quantity,
    customerName: item.order.user.name,
    customerEmail: item.order.user.email,
    paymentMethod: item.order.paymentMethod,
    status: item.order.status,
    createdAt: item.order.createdAt
  };
}

export async function getSellerReport(email) {
  const sellerEmail = email?.trim().toLowerCase();

  if (!sellerEmail) {
    throw createHttpError("El email del vendedor es obligatorio", 400);
  }

  const seller = await prisma.user.findUnique({
    where: { email: sellerEmail }
  });

  if (!seller) {
    throw createHttpError("Vendedor no encontrado", 404);
  }

  if (seller.role !== "SELLER") {
    throw createHttpError("Solo los vendedores pueden generar reportes", 403);
  }

  // Productos publicados por el vendedor
  const products = await prisma.product.findMany({
    where: {
      seller: sellerEmail
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Ventas relacionadas con productos del vendedor
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: {
        seller: sellerEmail
      }
    },
    include: {
      product: true,
      order: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      order: {
        createdAt: "desc"
      }
    }
  });

  const normalizedProducts = products.map(normalizeProduct);
  const normalizedSales = orderItems.map(normalizeOrderItem);

  const totalSales = normalizedSales.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );

  const totalUnitsSold = normalizedSales.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const activeProducts = normalizedProducts.filter(
    (product) => product.isActive
  ).length;

  return {
    seller: {
      id: seller.id,
      name: seller.name,
      email: seller.email
    },
    summary: {
      totalProducts: normalizedProducts.length,
      activeProducts,
      totalOrders: normalizedSales.length,
      totalUnitsSold,
      totalSales
    },
    products: normalizedProducts,
    sales: normalizedSales
  };
}
