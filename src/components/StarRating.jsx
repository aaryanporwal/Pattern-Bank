import { useState } from "react";

export default function StarRating({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && onChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className="select-none leading-none transition-colors duration-150"
          style={{
            cursor: interactive ? "pointer" : "default",
            fontSize: size,
            color: star <= (hover || value) ? "#e3b341" : "#30363d",
          }}
        >
          ★
        </span>
      ))}
      {interactive && (
        <span className="ml-1.5 text-xs text-pb-text-muted">
          {hover || value || 0}/5
        </span>
      )}
    </div>
  );
}
