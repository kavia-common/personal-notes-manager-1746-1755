import {
  component$,
  useSignal,
  useStore,
  useTask$,
  $,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { NoteList } from "../components/NoteList";
import { NoteEditor } from "../components/NoteEditor";
import { TopBar } from "../components/TopBar";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type Note,
} from "../utils/noteApi";

// PUBLIC_INTERFACE
export default component$(() => {
  const notes = useStore<Note[]>([]);
  const loading = useSignal(false);
  const selectedNoteId = useSignal<string | null>(null);
  const error = useSignal<string | null>(null);
  const editing = useSignal(false);
  const searchValue = useSignal("");
  const isNewNote = useSignal(false);

  // Fetch notes at mount/load
  useTask$(async () => {
    loading.value = true;
    try {
      const data = await getNotes();
      notes.splice(0, notes.length, ...data);
      // If there are notes, select the first by default
      if (data.length > 0 && selectedNoteId.value === null) {
        selectedNoteId.value = data[0].id;
      }
    } catch (err: any) {
      error.value = err?.message ?? "Failed to load notes";
    } finally {
      loading.value = false;
    }
  });

  const refetchNotes = $(async (selectId?: string) => {
    loading.value = true;
    try {
      const data = await getNotes();
      notes.splice(0, notes.length, ...data);
      if (data.length > 0) {
        selectedNoteId.value =
          selectId ??
          data.find((n) => n.id === selectedNoteId.value)?.id ??
          data[0].id;
      } else {
        selectedNoteId.value = null;
      }
    } finally {
      loading.value = false;
    }
  });

  // Handlers
  const handleSelect = $(async (id: string) => {
    selectedNoteId.value = id;
    editing.value = false;
    isNewNote.value = false;
    error.value = null;
  });

  const handleCreate = $(() => {
    selectedNoteId.value = null;
    editing.value = true;
    isNewNote.value = true;
    error.value = null;
  });

  const handleSave = $(async (note: { id?: string; title: string; content: string }) => {
    loading.value = true;
    try {
      if (isNewNote.value) {
        await createNote({ title: note.title, content: note.content });
      } else if (note.id) {
        await updateNote(note.id, { title: note.title, content: note.content });
      }
      editing.value = false;
      isNewNote.value = false;
      await refetchNotes();
    } catch (err: any) {
      error.value = err?.message ?? "Failed to save note";
    } finally {
      loading.value = false;
    }
  });

  const handleDelete = $(async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    loading.value = true;
    try {
      await deleteNote(id);
      // If currently editing or selected note was deleted, reset selection
      if (selectedNoteId.value === id) {
        selectedNoteId.value = null;
        editing.value = false;
        isNewNote.value = false;
      }
      await refetchNotes();
    } catch (err: any) {
      error.value = err?.message ?? "Failed to delete note";
    } finally {
      loading.value = false;
    }
  });

  const handleEdit = $(() => {
    editing.value = true;
    isNewNote.value = false;
    error.value = null;
  });

  const handleCancel = $(() => {
    editing.value = false;
    isNewNote.value = false;
    error.value = null;
  });

  const handleSearchChange = $((val: string) => {
    searchValue.value = val;
  });

  const selectedNote =
    isNewNote.value || !selectedNoteId.value
      ? null
      : notes.find((n) => n.id === selectedNoteId.value) ?? null;

  return (
    <div class="notes-app">
      <TopBar
        onCreateNote$={handleCreate}
        searchValue={searchValue.value}
        onSearchChange$={handleSearchChange}
      />
      <div class="layout">
        <NoteList
          notes={notes}
          selectedId={selectedNoteId.value}
          onSelect$={handleSelect}
          onDelete$={handleDelete}
          searchValue={searchValue.value}
        />
        <main class="main-panel">
          {error.value && <div class="error-msg">{error.value}</div>}
          {editing.value ? (
            <NoteEditor
              note={isNewNote.value ? null : selectedNote}
              onSave$={handleSave}
              loading={loading.value}
              isNew={isNewNote.value}
              onCancel$={handleCancel}
            />
          ) : selectedNote ? (
            <section class="note-details">
              <div class="details-header">
                <h2 class="details-title">{selectedNote.title}</h2>
                <button
                  class="action-btn"
                  type="button"
                  onClick$={handleEdit}
                  aria-label="Edit note"
                >
                  Edit
                </button>
              </div>
              <div class="details-content">{selectedNote.content}</div>
              <div class="details-footer">
                <span>
                  Last updated:{" "}
                  {new Date(selectedNote.updated_at).toLocaleString()}
                </span>
              </div>
            </section>
          ) : (
            <div class="no-note-msg">
              {notes.length === 0
                ? "You have no notes yet. Click 'New' to create one!"
                : "Select a note or create a new one."}
            </div>
          )}
        </main>
      </div>
    </div>
  );
});

// page meta
export const head: DocumentHead = {
  title: "Notes (Personal Notes Manager)",
  meta: [
    {
      name: "description",
      content: "A responsive, modern notes manager app built with Qwik.",
    },
  ],
};
