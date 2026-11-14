import { useId } from "react";

/**
 * The app icon, drawn as vector shapes. On hover (or focus) of the nearest
 * `group/logo` parent, the arrow drops into the tray: the moment the app is about.
 */
export function AppLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6bff" />
          <stop offset="0.5" stopColor="#6c33f5" />
          <stop offset="1" stopColor="#3a12a8" />
        </linearGradient>
        <clipPath id={`${id}-tray`}>
          <rect x="24.56" y="53.1" width="50.88" height="24.3" rx="6.2" />
        </clipPath>
      </defs>
      <rect x="10" y="10" width="80" height="80" rx="18" fill={`url(#${id}-bg)`} />
      {/* Tray, with its opening cut out so the background shows through */}
      <g clipPath={`url(#${id}-tray)`}>
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M24.56 53.1h50.88v24.3H24.56zM30.6 40H69.4V61.5a3.3 3.3 0 0 1-3.3 3.3H33.9a3.3 3.3 0 0 1-3.3-3.3z"
        />
      </g>
      {/* The three tabs: media, documents, everything else */}
      <rect x="31.2" y="69" width="9.7" height="4.3" rx="1.4" fill="#ffd23f" />
      <rect x="45.2" y="69" width="9.7" height="4.3" rx="1.4" fill="#3df2ff" />
      <rect x="59.2" y="69" width="9.7" height="4.3" rx="1.4" fill="#ff5d99" />
      {/* Arrow */}
      <g data-arrow className="transition-transform duration-300 ease-out [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover/logo:translate-y-[3px] group-focus-visible/logo:translate-y-[3px]">
        <rect x="45.9" y="21.1" width="8.15" height="24.2" rx="4.07" fill="#fff" />
        <path
          d="M35.4 41.5H64.5L50 60.9z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
