const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Servir el index.html y assets desde la carpeta actual
app.use(express.static(path.join(__dirname, '.')));

const ESTADO_FILE = path.join(__dirname, 'estado.json');

// Leer estado del JSON
app.get('/estado', (req, res) => {
  fs.readFile(ESTADO_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error leyendo estado.json:', err);
      return res.json({});
    }
    res.json(JSON.parse(data));
  });
});

// Actualizar un item
app.post('/actualizar', (req, res) => {
  const { key, valor } = req.body;

  fs.readFile(ESTADO_FILE, 'utf8', (err, data) => {
    const estado = err ? {} : JSON.parse(data);

    if (key in estado) {
      estado[key] = valor;
      fs.writeFile(ESTADO_FILE, JSON.stringify(estado, null, 2), 'utf8', () => {
        console.log(`✔ Actualizado: ${key} = ${valor}`);
        res.json({ ok: true });
      });
    } else {
      console.warn(`⚠ Key no encontrada: ${key}`);
      res.json({ ok: false, error: 'Clave inexistente' });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));
