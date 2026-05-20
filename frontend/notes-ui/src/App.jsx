import React, { useState, useEffect } from "react";
import { fetchNotes, fetchNote, createNote, updateNote, deleteNote } from "./api";

function App() {
  const [view, setView] = useState("list");
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes(query = "") {
    setLoading(true);
    try {
      const data = await fetchNotes(query);
      setNotes(data);
    } catch (e) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    loadNotes(value);
  }

  function goToCreate() {
    setCurrentNote(null);
    setView("form");
  }

  function goToEdit(note) {
    setCurrentNote(note);
    setView("form");
  }

  async function goToDetail(id) {
    setLoading(true);
    try {
      const note = await fetchNote(id);
      setCurrentNote(note);
      setView("detail");
    } catch (e) {
      setError("Failed to load note");
    } finally {
      setLoading(false);
    }
  }

  function goToList() {
    setView("list");
    setCurrentNote(null);
    loadNotes(search);
  }

  async function handleSave(data) {
    try {
      if (currentNote) {
        await updateNote(currentNote.id, data);
      } else {
        await createNote(data);
      }
      goToList();
    } catch (e) {
      throw e;
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
      goToList();
    } catch (e) {
      setError("Failed to delete note");
    }
  }

  return (
    <div className="app">
      {error && (
        <div style={{ color: "#d32f2f", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {error}
          <button
            onClick={() => setError("")}
            style={{ marginLeft: "0.5rem", border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            dismiss
          </button>
        </div>
      )}

      {view === "list" && (
        <NotesList
          notes={notes}
          loading={loading}
          search={search}
          onSearch={handleSearch}
          onCreate={goToCreate}
          onSelect={goToDetail}
        />
      )}

      {view === "detail" && currentNote && (
        <NoteDetail
          note={currentNote}
          onBack={goToList}
          onEdit={() => goToEdit(currentNote)}
          onDelete={handleDelete}
        />
      )}

      {view === "form" && (
        <NoteForm
          note={currentNote}
          onSave={handleSave}
          onCancel={goToList}
        />
      )}
    </div>
  );
}

function NotesList({ notes, loading, search, onSearch, onCreate, onSelect }) {
  return (
    <>
      <header>
        <h1>Notes</h1>
        <button className="btn btn-primary" onClick={onCreate}>
          + New Note
        </button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={onSearch}
        />
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          {search ? "No notes match your search." : "No notes yet. Create one to get started."}
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note.id} className="note-card" onClick={() => onSelect(note.id)}>
              <h3>{note.title}</h3>
              <p className="preview">{note.content || "No content"}</p>
              <div className="meta">
                <span>Created: {formatDate(note.createdAt)}</span>
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NoteDetail({ note, onBack, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="note-detail">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: "1rem" }}>
        &larr; Back
      </button>
      <h2>{note.title}</h2>
      <div className="meta">
        <span>Created: {formatDate(note.createdAt)}</span>
        <span>Updated: {formatDate(note.updatedAt)}</span>
      </div>
      <div className="content">{note.content || "No content"}</div>
      <div className="actions">
        <button className="btn btn-primary" onClick={onEdit}>Edit</button>
        <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Note</h3>
            <p>Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => onDelete(note.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteForm({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [content, setContent] = useState(note ? note.content : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title must not be empty");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-container">
      <button className="btn btn-secondary" onClick={onCancel} style={{ marginBottom: "1rem" }}>
        &larr; Back
      </button>
      <h2>{note ? "Edit Note" : "Create Note"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
          />
          {error && <div className="error-msg">{error}</div>}
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : note ? "Update" : "Create"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default App;
