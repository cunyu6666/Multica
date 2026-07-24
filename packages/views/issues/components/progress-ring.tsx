/**
 * [WHO]: Provides a small circular progress ring for done/total ratios
 * [FROM]: No external dependencies (pure SVG component)
 * [TO]: Consumed by various surfaces needing inline progress indicators
 * [HERE]: packages/views/issues/components/progress-ring.tsx - ProgressRing with open ring and fill arc states
 */

/**
 * Tiny circular progress ring. Renders an open ring when in-progress and
 * fills to a solid arc when complete.
 */
export function ProgressRing({
  done,
  total,
  size = 12,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const stroke = 1.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;
  const offset = circumference * (1 - ratio);
  const isComplete = total > 0 && done >= total;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={isComplete ? "text-info" : "text-primary"}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
