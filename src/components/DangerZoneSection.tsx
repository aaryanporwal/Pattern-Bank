interface Props {
  onSetAllDue: () => void;
  onRequestClearData: () => void;
  hideLabel?: boolean;
}

export default function DangerZoneSection({ onSetAllDue, onRequestClearData, hideLabel }: Props) {
  return (
    <div>
      {!hideLabel && (
        <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-pb-text-muted">
          Danger Zone
        </label>
      )}
      <div className="flex flex-col gap-2">
        <button
          onClick={onSetAllDue}
          className="w-full cursor-pointer rounded-lg border border-dashed border-[rgba(248,81,73,0.4)] bg-transparent px-3 py-2.5 text-sm text-[rgba(248,81,73,0.6)] transition-colors duration-150 hover:border-[rgba(248,81,73,0.6)] hover:text-[rgba(248,81,73,0.8)]"
        >
          Set all problems due today
        </button>
        <button
          onClick={onRequestClearData}
          className="w-full cursor-pointer rounded-lg border border-dashed border-[rgba(248,81,73,0.4)] bg-transparent px-3 py-2.5 text-sm text-[rgba(248,81,73,0.6)] transition-colors duration-150 hover:border-[rgba(248,81,73,0.6)] hover:text-[rgba(248,81,73,0.8)]"
        >
          Clear all data
        </button>
      </div>
    </div>
  );
}
