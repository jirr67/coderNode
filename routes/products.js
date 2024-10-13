
const express = require('express');
const fs = require('fs').promises;  
const path = require('path');
const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, '../productos.json');

const readProductsFile = async () => {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};


const writeProductsFile = async (products) => {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};


router.get('/', async (req, res) => {
  const products = await readProductsFile();
  const limit = parseInt(req.query.limit);
  
  if (limit && limit > 0) {
    return res.json(products.slice(0, limit));
  }

  res.json(products);
});


router.get('/:pid', async (req, res) => {
  const products = await readProductsFile();
  const productId = parseInt(req.params.pid);
  const product = products.find(p => p.id === productId);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});


router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails = [] } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, excepto thumbnails.' });
  }

  const products = await readProductsFile();
  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    title,
    description,
    code,
    price,
    status: true,
    stock,
    category,
    thumbnails
  };

  products.push(newProduct);
  await writeProductsFile(products);

  res.status(201).json(newProduct);
});


router.put('/:pid', async (req, res) => {
  const products = await readProductsFile();
  const productId = parseInt(req.params.pid);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const updatedFields = req.body;
  const { id, ...fieldsToUpdate } = updatedFields; 

  products[productIndex] = { ...products[productIndex], ...fieldsToUpdate };
  await writeProductsFile(products);

  res.json(products[productIndex]);
});


router.delete('/:pid', async (req, res) => {
  const products = await readProductsFile();
  const productId = parseInt(req.params.pid);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const updatedProducts = products.filter(p => p.id !== productId);
  await writeProductsFile(updatedProducts);

  res.status(204).end();
});

module.exports = router;
