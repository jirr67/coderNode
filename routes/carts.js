
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const CARTS_FILE = path.join(__dirname, '../carrito.json');
const PRODUCTS_FILE = path.join(__dirname, '../productos.json');



const readCartsFile = async () => {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeCartsFile = async (carts) => {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
};


const readProductsFile = async () => {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};


router.post('/', async (req, res) => {
  const carts = await readCartsFile();
  const newCart = {
    id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
    products: []
  };

  carts.push(newCart);
  await writeCartsFile(carts);

  res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
  const carts = await readCartsFile();
  const cartId = parseInt(req.params.cid);
  const cart = carts.find(c => c.id === cartId);

  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});


router.post('/:cid/product/:pid', async (req, res) => {
  const carts = await readCartsFile();
  const products = await readProductsFile();
  const cartId = parseInt(req.params.cid);
  const productId = parseInt(req.params.pid);

  const cart = carts.find(c => c.id === cartId);
  const product = products.find(p => p.id === productId);

  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const existingProduct = cart.products.find(p => p.product === productId);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: productId, quantity: 1 });
  }

  await writeCartsFile(carts);

  res.json(cart);
});

module.exports = router;
