const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store
let items = [
  { id: 1, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', price: 29.99 },
  { id: 2, name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard', price: 89.99 },
  { id: 3, name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and SD card reader', price: 45.5 },
];
let nextId = 4;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve front-end page
app.get('/', (req, res) => {
  res.render('index', { title: 'Items Manager' });
});

// GET /api/items - Fetch all items
app.get('/api/items', (req, res) => {
  res.json({ success: true, data: items });
});

// POST /api/items - Create a new item
app.post('/api/items', (req, res) => {
  const { name, description, price } = req.body; 
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const parsedPrice = parseFloat(price);
  if (price === undefined || price === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ success: false, message: 'A valid non-negative price is required.' });
  }

  const newItem = {
    id: nextId++,
    name: name.trim(),
    description: description ? description.trim() : '',
    price: parsedPrice,
  };

  items.push(newItem);
  res.status(201).json({ success: true, message: 'Item created successfully.', data: newItem });
});

// PUT /api/items/:id - Update an existing item
app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID.' });
  }

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: `Item with ID ${id} not found.` });
  }


  const { name, description, price } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const parsedPrice = parseFloat(price);
  if (price === undefined || price === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ success: false, message: 'A valid non-negative price is required.' });
  }

  const updatedItem = {
    id,
    name: name.trim(),
    description: description ? description.trim() : '',
    price: parsedPrice,
  };

  items[index] = updatedItem;
  res.json({ success: true, message: 'Item updated successfully.', data: updatedItem });
});

// DELETE /api/items/:id - Delete an item
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID.' });
  }

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: `Item with ID ${id} not found.` });
  }

  const deletedItem = items.splice(index, 1)[0];
  res.json({ success: true, message: 'Item deleted successfully.', data: deletedItem });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
