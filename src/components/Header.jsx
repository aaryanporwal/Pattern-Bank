export default function Header({ onSettingsClick }) {
  return (
    <div className="sticky top-0 z-[800] flex items-center justify-between border-b border-pb-border bg-pb-surface px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="text-base font-bold leading-none text-pb-accent">⟡</span>
        <h1 className="text-lg font-bold tracking-tight text-pb-text">
          PatternBank
        </h1>
      </div>
      <button
        onClick={onSettingsClick}
        title="Settings"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-pb-border bg-transparent text-lg text-pb-text-muted transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text"
      >
        ⚙
      </button>
    </div>
  );
}
