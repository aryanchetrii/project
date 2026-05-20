const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, "notes.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// GET /notes - fetch all notes, sorted by most recently updated
app.get("/notes", (req, res) => {
  const { search } = req.query;

  let notes;
  if (search) {
    const term = `%${search}%`;
    notes = db
      .prepare(
        "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updatedAt DESC"
      )
      .all(term, term);
  } else {
    notes = db.prepare("SELECT * FROM notes ORDER BY updatedAt DESC").all();
  }

  res.json(notes);
});

// GET /notes/:id - fetch single note
app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.json(note);
});

// POST /notes - create a new note
app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title must not be empty" });
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO notes (title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?)"
    )
    .run(title.trim(), (content || "").trim(), now, now);

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(note);
});

// PUT /notes/:id - update a note
app.put("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title must not be empty" });
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?").run(
    title.trim(),
    (content || "").trim(),
    now,
    id
  );

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  res.json(note);
});

// DELETE /notes/:id - delete a note
app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ message: "Note not found" });
  }

  db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  res.json({ message: "Note deleted" });
});

app.listen(PORT, () => {
  console.log(`Notes API running on http://localhost:${PORT}`);
});
