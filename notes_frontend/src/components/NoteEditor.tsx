import { component$, useSignal } from "@builder.io/qwik";
import type { Note } from "./NoteList";
import type { PropFunction } from "@builder.io/qwik";

interface NoteEditorProps {
  note: Note | null;
  onSave$: PropFunction<(note: { id?: string; title: string; content: string }) => void>;
  onCancel$: PropFunction<() => void>;
  loading: boolean;
  isNew: boolean;
}

// PUBLIC_INTERFACE
export const NoteEditor = component$((props: NoteEditorProps) => {
  const titleSig = useSignal(props.note?.title ?? "");
  const contentSig = useSignal(props.note?.content ?? "");

  // Sync signals when switching to a new note or from new <-> edit
  if (
    (props.isNew && (titleSig.value !== "" || contentSig.value !== "")) ||
    (!props.isNew && props.note && titleSig.value !== props.note.title)
  ) {
    titleSig.value = props.note?.title ?? "";
    contentSig.value = props.note?.content ?? "";
  }

  // Note: We must NOT reference function props directly inside $ or event handlers!
  return (
    <form
      class="note-editor"
      preventdefault:submit
      onSubmit$={async (e) => {
        e.preventDefault();
        // Use Qwik's PropFunction execution (await!) to ensure serializability.
        await props.onSave$({
          id: props.note?.id,
          title: titleSig.value,
          content: contentSig.value,
        });
      }}
      aria-label={props.isNew ? "Create note" : "Edit note"}
    >
      <input
        class="note-title-input"
        type="text"
        name="title"
        placeholder="Title"
        value={titleSig.value}
        onInput$={(e) =>
          (titleSig.value = (e.target as HTMLInputElement).value)
        }
        required
        autoFocus
        aria-label="Title"
      />
      <textarea
        class="note-content-input"
        name="content"
        placeholder="Write your note here..."
        rows={10}
        value={contentSig.value}
        onInput$={(e) =>
          (contentSig.value = (e.target as HTMLTextAreaElement).value)
        }
        aria-label="Content"
      />
      <div class="editor-actions">
        <button
          class="action-btn primary"
          type="submit"
          disabled={props.loading}
        >
          {props.isNew ? "Create" : "Save"}
        </button>
        <button
          class="action-btn secondary"
          type="button"
          onClick$={async () => {
            await props.onCancel$();
          }}
          disabled={props.loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
});
