export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`planeo-logo ${compact ? "is-compact" : ""}`}>
      <span className="planeo-logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {!compact && <strong>Planeo</strong>}
    </span>
  );
}
