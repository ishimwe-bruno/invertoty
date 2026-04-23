import { Op } from 'sequelize';
import { Product, ProductHistory } from '../database/index.js';

// Helper function to log product history
const logHistory = async (productId, action, userId, previousQuantity = null, newQuantity = null, product = null, changeDetails = null) => {
  try {
    await ProductHistory.create({
      productId,
      userId,
      action,
      previousQuantity,
      newQuantity,
      productName: product?.name,
      productSku: product?.sku,
      productPrice: product?.price,
      description: product?.description,
      changeDetails,
    });
  } catch (err) {
    console.error('Error logging history:', err.message);
  }
};

export const getAll = async (req, res) => {
  res.json(await Product.findAll());
};

export const getOne = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const create = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    // Log creation to history
    await logHistory(
      newProduct.id,
      'create',
      req.user?.id,
      null,
      newProduct.quantity,
      newProduct
    );
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  const previousQuantity = product.quantity;
  const updatedProduct = await product.update(req.body);
  
  // Log update to history if quantity changed or other fields changed
  const changeDetails = {};
  Object.keys(req.body).forEach(key => {
    if (product[key] !== req.body[key] && key !== 'quantity') {
      changeDetails[key] = { old: product[key], new: req.body[key] };
    }
  });
  
  await logHistory(
    product.id,
    'update',
    req.user?.id,
    previousQuantity,
    updatedProduct.quantity,
    updatedProduct,
    Object.keys(changeDetails).length > 0 ? changeDetails : null
  );
  
  res.json(updatedProduct);
};

export const remove = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  
  // Log deletion to history
  await logHistory(
    product.id,
    'delete',
    req.user?.id,
    product.quantity,
    0,
    product
  );
  
  await product.destroy();
  res.json({ message: 'Product deleted' });
};

export const lowStock = async (req, res) => {
  const products = await Product.findAll({
    where: { quantity: { [Op.lte]: Product.sequelize.col('minStock') } },
  });
  res.json(products);
};
