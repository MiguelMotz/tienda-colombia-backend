import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
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

export async function editProduct(req, res, next) {
  try {
    const product = await updateProduct(req.params.id, req.body);

    res.json({
      ok: true,
      message: "Producto actualizado correctamente",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProduct(req, res, next) {
  try {
    const deletedProduct = await deleteProduct(req.params.id, req.body);

    res.json({
      ok: true,
      message: "Producto eliminado correctamente",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
}