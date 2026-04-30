import {
  createOrder,
  getOrdersByUser,
} from "../services/order.service.js";

export async function storeOrder(req, res, next) {
  try {
    const order = await createOrder(req.body);

    res.status(201).json({
      ok: true,
      message: "Pedido creado correctamente",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function myOrders(req, res, next) {
  try {
    const { email } = req.query;
    const orders = await getOrdersByUser(email);

    res.json({
      ok: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}