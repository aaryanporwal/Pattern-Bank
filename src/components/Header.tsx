import type { SyncStatus } from "../types";

interface DotInfo {
  color: string;
  title: string;
  animation: string;
}

interface Props {
  onSettingsClick: () => void;
  onHelpClick: () => void;
  onThemeClick: () => void;
  syncStatus: SyncStatus;
}

function PaletteIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.75c-4.56 0-8.25 3.25-8.25 7.26 0 3.67 3.13 6.8 7.16 7.22h1.34c.88 0 1.49-.78 1.32-1.64l-.12-.62c-.16-.84.48-1.61 1.33-1.61h1.51c2.29 0 3.96-1.56 3.96-3.72 0-3.81-3.69-6.89-8.25-6.89Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.25" cy="10" r="1" fill="currentColor" />
      <circle cx="11.2" cy="7.6" r="1" fill="currentColor" />
      <circle cx="14.7" cy="8.15" r="1" fill="currentColor" />
      <circle cx="16.8" cy="11.05" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Header({ onSettingsClick, onHelpClick, onThemeClick, syncStatus }: Props) {
  const dot: Partial<Record<SyncStatus, DotInfo>> = {
    syncing: { color: "#d29922", title: "Syncing...", animation: "sync-pulse 1.5s ease-in-out infinite" },
    synced: { color: "#3fb950", title: "Synced", animation: "none" },
    error: { color: "#f85149", title: "Sync error", animation: "none" },
  };

  const statusInfo = dot[syncStatus] || null;

  return (
    <div className="sticky top-0 z-[800] flex items-center justify-between border-b border-pb-border bg-pb-surface px-5 py-4">
      <div className="flex items-center gap-2.5">
        <img src="/favicon-32.png" alt="" className="h-5 w-5 rounded" />
        <h1 className="text-lg font-bold tracking-tight text-pb-text">
          PatternBank
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {statusInfo && (
          <span
            title={statusInfo.title}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: statusInfo.color,
              animation: statusInfo.animation,
              display: "inline-block",
            }}
          />
        )}
        <button
          onClick={onThemeClick}
          title="Theme"
          aria-label="Theme"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-pb-border bg-transparent text-pb-text-muted transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text"
        >
          <PaletteIcon />
        </button>
        <button
          onClick={onHelpClick}
          title="Help"
          aria-label="Help"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-pb-border bg-transparent text-[18px] font-semibold text-pb-text-muted transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text"
        >
          ?
        </button>
        <button
          onClick={onSettingsClick}
          title="Settings"
          aria-label="Settings"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-pb-border bg-transparent text-[23px] text-pb-text-muted transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text"
        >
          ⚙
        </button>
      </div>
    </div>
  );
}
