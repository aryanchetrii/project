## Project Overview

This project contains three components:

- **Backend** - A Notes REST API built with Express.js and SQLite
- **Frontend** - A Notes UI built with React and Vite

---


## Notes Management System

### Backend

**Features:**
- Full CRUD operations for notes
- Search functionality
- Input validation with proper error messages
- Proper HTTP status codes
- Notes sorted by most recently updated

### Frontend

**Features:**
- Notes listing page with title, content preview, and timestamps
- Create new notes with title and content
- Edit existing notes (updatedAt updates automatically)
- Delete notes with confirmation dialog
- Search notes by title or content
- Loading states while fetching data
- Empty states (no notes / no search results)
- Error handling with dismissable messages
- Responsive design
- Form validation (title required)

---

## How to Run

### Backend Setup
cd backend/notes-api
npm install
npm start

The API will run at **http://localhost:4000**

### Frontend Setup
cd frontend/notes-ui
npm install
npm run dev

The UI will run at **http://localhost:3000**

### Running the Core Task

---

## API Documentation

Base URL: `http://localhost:4000`

### Endpoints

#### GET /notes

Fetch all notes, sorted by most recently updated.

**Query Parameters:**
- `search` (optional) — filter notes by title or content

**Response:** `200 OK`

[
  {
    "id": 1,
    "title": "My Note",
    "content": "Note content here",
    "createdAt": "2026-05-20T10:30:00.000Z",
    "updatedAt": "2026-05-20T10:30:00.000Z"
  }
]

---

#### GET /notes/:id

Fetch a single note by ID.

**Response:** `200 OK`

{
  "id": 1,
  "title": "My Note",
  "content": "Note content here",
  "createdAt": "2026-05-20T10:30:00.000Z",
  "updatedAt": "2026-05-20T10:30:00.000Z"
}

---

#### POST /notes

Create a new note.

**Request Body:**

{
  "title": "My Note",
  "content": "Note content here"
}

**Response:** `201 Created`

{
  "id": 3,
  "title": "My Note",
  "content": "Note content here",
  "createdAt": "2026-05-20T10:30:00.000Z",
  "updatedAt": "2026-05-20T10:30:00.000Z"
}

---

#### PUT /notes/:id

Update an existing note.

**Request Body:**

{
  "title": "Updated Title",
  "content": "Updated content"
}

**Response:** `200 OK`

{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content",
  "createdAt": "2026-05-20T10:30:00.000Z",
  "updatedAt": "2026-05-20T11:00:00.000Z"
}

---

#### DELETE /notes/:id

Delete a note.

**Response:** `200 OK`
{ "message": "Note deleted" }