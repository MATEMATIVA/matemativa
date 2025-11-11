const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Banco de dados
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

// Criação das tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT NOT NULL,
      local TEXT,
      descricao TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS participantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      evento_id INTEGER,
      nota INTEGER,
      comentario TEXT,
      FOREIGN KEY (evento_id) REFERENCES eventos(id)
    )
  `);
});

// Rotas de eventos
app.get('/eventos', (req, res) => {
  db.all('SELECT * FROM eventos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/eventos', (req, res) => {
  const { nome, data, local, descricao } = req.body;
  db.run(
    `INSERT INTO eventos (nome, data, local, descricao) VALUES (?, ?, ?, ?)`,
    [nome, data, local, descricao],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, nome, data, local, descricao });
    }
  );
});

// Rotas de participantes
app.get('/participantes', (req, res) => {
  db.all('SELECT * FROM participantes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/participantes', (req, res) => {
  const { nome, email, evento_id } = req.body;
  db.run(
    `INSERT INTO participantes (nome, email, evento_id) VALUES (?, ?, ?)`,
    [nome, email, evento_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, nome, email, evento_id });
    }
  );
});

// Avaliação de participante
app.put('/participantes/:id/avaliar', (req, res) => {
  const { id } = req.params;
  const { nota, comentario } = req.body;
  db.run(
    `UPDATE participantes SET nota = ?, comentario = ? WHERE id = ?`,
    [nota, comentario, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, nota, comentario });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
