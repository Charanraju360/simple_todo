require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- DB CONFIG (reads from .env) ---
const pool = new Pool({
  host:     process.env.PG_HOST,
  port:     process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user:     process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});

// Auto-create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id        SERIAL PRIMARY KEY,
    title     TEXT        NOT NULL,
    done      BOOLEAN     DEFAULT FALSE,
    priority  TEXT        DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).then(() => console.log('Table ready'))
  .catch(err => console.error('Table init failed:', err));

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
  const { title, priority = 'medium' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, priority) VALUES ($1, $2) RETURNING *',
      [title.trim(), priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle done / update fields
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 1}`);
  const vals = Object.values(fields);
  try {
    const result = await pool.query(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${vals.length + 1} RETURNING *`,
      [...vals, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id', [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));