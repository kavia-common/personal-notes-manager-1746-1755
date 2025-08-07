import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

export interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect$: PropFunction<(id: string) => void>;
  onDelete$: PropFunction<(id: string) => void>;
  searchValue: string;
}

// PUBLIC_INTERFACE
export const NoteList = component$((props: NoteListProps) => {
  const filteredNotes = !props.searchValue
    ? props.notes
    : props.notes.filter((n) =>
        n.title.toLowerCase().includes(props.searchValue.toLowerCase())
      );

  return (
    <aside class="sidebar" role="navigation" aria-label="Notes list">
      <ul class="note-list">
        {filteredNotes.length === 0 && (
          <li class="empty-list">No notes found.</li>
        )}
        {filteredNotes.map((note) => (
          <li
            key={note.id}
            class={
              "note-list-item" +
              (props.selectedId === note.id ? " selected" : "")
            }
            tabIndex={0}
            aria-current={props.selectedId === note.id ? "page" : undefined}
            onClick$={async () => {
              await props.onSelect$(note.id);
            }}
          >
            <div class="note-title">{note.title || <i>(Untitled)</i>}</div>
            <button
              class="delete-btn"
              title="Delete"
              onClick$={async (e) => {
                e.stopPropagation();
                await props.onDelete$(note.id);
              }}
              aria-label="Delete note"
              type="button"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
});
