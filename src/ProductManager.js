const express = require('express');
const http = require('http');
const path = require('path');
const exphbs = require('express-handlebars');
const socketIO = require('socket.io');
const fs = require('fs/promises');

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async addProduct(product, io) {
    const products = await this.readProductsFile();

    const id =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    product.id = id;

    products.push(product);

    await this.writeProductsFile(products);

    io.emit('updateProducts', products);

    console.log('Producto agregado:', product);
  }

  async getProducts() {
    const products = await this.readProductsFile();
    return products;
  }

  async getProductById(id) {
    const products = await this.readProductsFile();

    const product = products.find((p) => p.id === id);

    if (product) {
      return product;
    } else {
      console.error('Producto no encontrado');
    }
  }

  async updateProduct(id, updatedFields) {
    const products = await this.readProductsFile();

    const index = products.findIndex((p) => p.id === id);

    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };

      await this.writeProductsFile(products);

      console.log('Producto actualizado:', products[index]);
    } else {
      console.error('Producto no encontrado');
    }
  }

  async deleteProduct(id) {
    const products = await this.readProductsFile();

    const filteredProducts = products.filter((p) => p.id !== id);

    if (filteredProducts.length < products.length) {
      await this.writeProductsFile(filteredProducts);

      console.log('Producto eliminado con éxito');
    } else {
      console.error('Producto no encontrado');
    }
  }

  async readProductsFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeProductsFile(products) {
    await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
  }
}

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const products = await PM.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await PM.getProducts();
  res.render('realTimeProducts', { products });
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

const PM = new ProductManager('ruta/del/archivo.json');

(async () => {
  await PM.addProduct(
    'ryzen 5',
    'Procesadores marca amd',
    200,
    'https://gorilagames.com/img/Public/1019-producto-processador-amd-ryzen-5-5600-r5-5600-505.jpg',
    'asd123',
    15
  );
  await PM.addProduct(
    'i5',
    'Procesadores marca intel',
    300,
    'https://www.qloud.ar/SITES/IMG/gaming-point-06-2021/221_13-10-2022-03-10-51-ld0005914924_1.jpg',
    'qwe123',
    30
  );

  console.log('Los productos disponibles en la lista son: ', await PM.getProducts());

  const productIdToUpdate = 1;
  await PM.updateProduct(productIdToUpdate, { price: 29.99 });

  const productIdToDelete = 1;
  await PM.deleteProduct(productIdToDelete);
})();
