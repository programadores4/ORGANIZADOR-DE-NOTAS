const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const staticDir = path.join(__dirname, 'organizador de notas');

// Serve static assets from 'organizador de notas' at the root
app.use(express.static(staticDir));
// Also support explicit '/organizador de notas' URLs if requested
app.use('/organizador de notas', express.static(staticDir));

// Default entry routes
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'menu.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(staticDir, 'menu.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
