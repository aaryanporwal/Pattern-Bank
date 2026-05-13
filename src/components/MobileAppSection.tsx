import { useState } from "react";
import qrAppStore from "../assets/qr-appstore.png";

const APP_STORE_URL = "https://apps.apple.com/app/patternbank/id6759760762";

export default function MobileAppSection() {
  const [showQr, setShowQr] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold tracking-wide text-pb-text-muted">
        Mobile app
      </label>

      {/* Desktop: button that toggles QR */}
      <button
        onClick={() => setShowQr(!showQr)}
        className="hidden w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-pb-border bg-transparent px-3.5 py-2.5 text-[13px] font-medium text-pb-text-muted transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text md:flex"
      >
        <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        App Store
      </button>

      {/* QR code revealed on toggle */}
      {showQr && (
        <div className="mt-3 hidden flex-col items-center md:flex">
          <div className="mb-2 rounded-xl border border-pb-border bg-white p-3">
            <img src={qrAppStore} alt="Download PatternBank on the App Store" width={148} height={148} className="block" />
          </div>
          <span className="text-xs text-pb-text-dim">Scan to download on iOS</span>
        </div>
      )}

      <p className="mb-2.5 text-xs leading-relaxed text-pb-text-dim">
        Your data syncs automatically when signed in.
      </p>

      {/* Mobile: direct download link (unchanged) */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-pb-border bg-transparent px-3.5 py-2.5 text-[13px] font-medium text-pb-text-muted no-underline transition-all duration-150 hover:border-pb-text-muted hover:text-pb-text md:hidden"
      >
        Download on App Store
      </a>
    </div>
  );
}
