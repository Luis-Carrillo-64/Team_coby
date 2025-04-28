// Archivo: server.js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/saludo', (req, res) => {
  res.send('¡Hola desde el servidor de Luis (Backend)!');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
