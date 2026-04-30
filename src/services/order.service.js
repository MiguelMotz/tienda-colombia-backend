import { prisma } from "../config/prisma.js";

function normalizeOrder(order) {
  return {
    id: order.id,
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.productId,
      orderItemId: item.id,
      title: item.productTitleSnapshot,
      price: Number(item.unitPrice),
      quantity: item.quantity,
    })),
  };
}

export async function createOrder(payload) {
  const { userEmail, customer, items, total, paymentMethod } = payload;

  if (!userEmail || !Array.isArray(items) || items.length === 0) {
    const error = new Error("Datos de pedido inválidos");
    error.status = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: Number(item.id) },
      });

      if (!product || !product.isActive) {
        const error = new Error(`Producto no disponible: ${item.title}`);
        error.status = 400;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(`Stock insuficiente para: ${product.title}`);
        error.status = 400;
        throw error;
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    return tx.order.create({
      data: {
        userId: user.id,
        total,
        paymentMethod,
        status: "PAID",
        items: {
          create: items.map((item) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity),
            unitPrice: Number(item.price),
            productTitleSnapshot: item.title,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  });

  return normalizeOrder(order);
}

export async function getOrdersByUser(email) {
  if (!email) return [];

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return [];

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(normalizeOrder);
}