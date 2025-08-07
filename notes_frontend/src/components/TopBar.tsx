import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

interface TopBarProps {
  onCreateNote$: PropFunction<() => void>;
  searchValue: string;
  onSearchChange$: PropFunction<(val: string) => void>;
}

// PUBLIC_INTERFACE
export const TopBar = component$((props: TopBarProps) => {
  return (
    <header class="topbar">
      <button
        class="topbar-btn accent"
        type="button"
        onClick$={async () => {
          await props.onCreateNote$();
        }}
        aria-label="Create new note"
      >
        ＋ New
      </button>
      <div class="topbar-search">
        <input
          class="search-input"
          type="text"
          placeholder="Search notes..."
          aria-label="Search notes"
          value={props.searchValue}
          onInput$={async (e) => {
            await props.onSearchChange$((e.target as HTMLInputElement).value);
          }}
        />
      </div>
    </header>
  );
});
