import { useEffect, useRef, useState } from "react";

interface InlineEditorProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  ariaLabel: string;
}

export function InlineEditor({
  value,
  onSave,
  className = "",
  ariaLabel,
}: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const nextValue = draft.trim();
    if (nextValue && nextValue !== value) onSave(nextValue);
    else setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        className={`inline-title ${className}`}
        onClick={() => setEditing(true)}
        aria-label={`${ariaLabel}: ${value}`}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      className={`inline-title-input ${className}`}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      aria-label={ariaLabel}
    />
  );
}
