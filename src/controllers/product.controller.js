import {
  createProduct,
  getAllProducts,
  getProductById,
} from "../services/product.service.js";

export async function listProducts(req, res, next) {
  try {
    const products = await getAllProducts();

    res.json({
      ok: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      ok: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function storeProduct(req, res, next) {
  try {
    const product = await createProduct(req.body);

    res.status(201).json({
      ok: true,
      message: "Producto publicado correctamente",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}