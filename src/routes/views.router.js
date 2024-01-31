const express = require('express');
const productManager = require('./ProductManager');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10);
    const products = await productManager.getProducts();

    if (!isNaN(limit)) {
      res.json(products.slice(0, limit));
    } else {
      res.json(products);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    const product = await productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/', async (req, res) => {
  try {
    const product = req.body;
    await productManager.addProduct(product);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    const updatedFields = req.body;
    await productManager.updateProduct(productId, updatedFields);
    res.send('Product updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    await productManager.deleteProduct(productId);
    res.send('Product deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/socket', (req, res) => {
  res.render('socket')
})

module.exports = router;
