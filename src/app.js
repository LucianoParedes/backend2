const express = require('express');
const fs = require('fs/promises');

const app = express();
const port = 8080;

app.use(express.json());

const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10);
    const products = await readProductsFile();

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

productsRouter.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    const product = await getProductById(productId);

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

productsRouter.post('/', async (req, res) => {
  try {
    const product = req.body;
    await addProduct(product);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.put('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    const updatedFields = req.body;
    await updateProduct(productId, updatedFields);
    res.send('Product updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

productsRouter.delete('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid, 10);
    await deleteProduct(productId);
    res.send('Product deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
  try {
    const cart = req.body;
    await createCart(cart);
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

cartsRouter.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await getCartById(cartId);

    if (cart) {
      res.json(cart);
    } else {
      res.status(404).send('Cart not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;
    await addProductToCart(cartId, productId, quantity);
    res.send('Product added to cart successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

async function readProductsFile() {
  try {
    const data = await fs.readFile('productos.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function getProductById(id) {
  const products = await readProductsFile();
  return products.find(p => p.id === id);
}

async function addProduct(product) {
  const products = await readProductsFile();
  const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  product.id = id;
  products.push(product);
  await fs.writeFile('productos.json', JSON.stringify(products, null, 2), 'utf-8');
}

async function updateProduct(id, updatedFields) {
  const products = await readProductsFile();
  const index = products.findIndex(p => p.id === id);

  if (index !== -1) {
    products[index] = { ...products[index], ...updatedFields };
    await fs.writeFile('productos.json', JSON.stringify(products, null, 2), 'utf-8');
  } else {
    throw new Error('Product not found');
  }
}

async function deleteProduct(id) {
  const products = await readProductsFile();
  const filteredProducts = products.filter(p => p.id !== id);

  if (filteredProducts.length < products.length) {
    await fs.writeFile('productos.json', JSON.stringify(filteredProducts, null, 2), 'utf-8');
  } else {
    throw new Error('Product not found');
  }
}

async function createCart(cart) {
  const carts = await readCartsFile();
  const id = generateUniqueId(carts.map(c => c.id));
  cart.id = id;
  carts.push(cart);
  await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2), 'utf-8');
}

async function getCartById(id) {
  const carts = await readCartsFile();
  return carts.find(c => c.id === id);
}

async function addProductToCart(cartId, productId, quantity) {
  const carts = await readCartsFile();
  const cartIndex = carts.findIndex(c => c.id === cartId);

  if (cartIndex !== -1) {
    const product = { id: productId, quantity };
    const existingProductIndex = carts[cartIndex].products.findIndex(p => p.id === productId);

    if (existingProductIndex !== -1) {
      carts[cartIndex].products[existingProductIndex].quantity += quantity;
    } else {
      carts[cartIndex].products.push(product);
    }

    await fs.writeFile('carrito.json', JSON.stringify(carts, null, 2), 'utf-8');
  } else {
    throw new Error('Cart not found');
  }
}

function generateUniqueId(existingIds) {
  let id;
  do {
    id = Math.random().toString(36).substr(2, 9);
  } while (existingIds.includes(id));

  return id;
}

async function readCartsFile() {
  try {
    const data = await fs.readFile('carrito.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}