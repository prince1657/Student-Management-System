const path = require('path');
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', (req, res, next) => {
  console.log(`  ${req.method.padEnd(6)} ${req.originalUrl}`);
  next();
});

app.use('/api', require('./routes'));
app.use('/api', notFound);

app.use(express.static(PUBLIC_DIR));

// Client-side routing: any non-API path renders the shell.
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use(errorHandler);

module.exports = app;
