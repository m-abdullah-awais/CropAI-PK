import { cn } from "@/lib/utils";

// The product's signature: a soil cross-section. Recommendation is literally a soil
// test (N, P, K, pH), and soil is the shared substrate of all three tools, so the
// motif doubles as the device that makes the tools read as one family.

type Accent = "recommend" | "yield" | "rotation";

const ACCENT_VAR: Record<Accent, string> = {
  recommend: "var(--tool-recommend)",
  yield: "var(--tool-yield)",
  rotation: "var(--tool-rotation)",
};

// A horizon (dark humus) over B horizon (ochre subsoil) over C horizon (pale parent).
const STRATA_RULE =
  "linear-gradient(to bottom, var(--earth-1) 0 34%, var(--earth-2) 34% 68%, var(--earth-3) 68% 100%)";
const STRATA_HERO =
  "linear-gradient(to bottom, var(--earth-1) 0 26%, var(--earth-2) 26% 56%, var(--earth-3) 56% 100%)";

function Sprig({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 40"
      width="24"
      height="40"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M12 40 V 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 25 C 6 23, 4 17, 6 12 C 11 13, 13 19, 12 25 Z"
        fill="currentColor"
      />
      <path
        d="M12 20 C 18 18, 20 12, 18 7 C 13 8, 11 14, 12 20 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SoilHorizon({
  variant = "rule",
  accent,
  className,
}: {
  variant?: "rule" | "hero";
  accent?: Accent;
  className?: string;
}) {
  const line = accent ? ACCENT_VAR[accent] : "var(--earth-line)";

  if (variant === "rule") {
    return (
      <div
        aria-hidden
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          className,
        )}
      >
        <div className="absolute inset-0" style={{ background: STRATA_RULE }} />
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: line }}
        />
      </div>
    );
  }

  // Cross-section anchored to the bottom of a relatively-positioned hero.
  const soilTop = "44%"; // soil occupies the bottom 56% of the band
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden sm:h-36",
        className,
      )}
    >
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ top: soilTop, background: STRATA_HERO }}
      />
      <div
        className="absolute inset-x-0 bottom-0 opacity-20 mix-blend-soft-light"
        style={{
          top: soilTop,
          backgroundImage:
            "radial-gradient(circle, var(--earth-3) 0.6px, transparent 0.7px)",
          backgroundSize: "9px 9px",
        }}
      />
      <div
        className="absolute inset-x-0 h-[2px]"
        style={{ top: soilTop, background: line }}
      />
      <div className="absolute inset-x-0" style={{ top: `calc(${soilTop} - 34px)` }}>
        <div className="relative mx-auto h-9 max-w-6xl px-4">
          <Sprig
            className="absolute bottom-0 left-[16%] opacity-50"
            style={{ color: line }}
          />
          <Sprig
            className="absolute bottom-0 left-1/2 h-11 w-7 -translate-x-1/2 opacity-60"
            style={{ color: line }}
          />
          <Sprig
            className="absolute bottom-0 left-[80%] opacity-45"
            style={{ color: line }}
          />
        </div>
      </div>
    </div>
  );
}
