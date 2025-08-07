const API_BASE =
  typeof import.meta.env !== "undefined" && import.meta.env.VITE_NOTES_API_BASE
    ? import.meta.env.VITE_NOTES_API_BASE
    : "http://localhost:8000/api";

export interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

// PUBLIC_INTERFACE
export async function getNotes(): Promise<Note[]> {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

// PUBLIC_INTERFACE
export async function getNote(id: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

// PUBLIC_INTERFACE
export async function createNote(note: { title: string; content: string }) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

// PUBLIC_INTERFACE
export async function updateNote(
  id: string,
  note: { title: string; content: string }
) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

// PUBLIC_INTERFACE
export async function deleteNote(id: string) {
  const res = await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
}
