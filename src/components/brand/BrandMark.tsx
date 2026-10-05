import { cn } from "@/utils/helpers";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Compact MaintainPro icon mark (rounded square, brand navy background baked into the asset).
 * Used anywhere the full wordmark would be too large: navbars, sidebars, inline links.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <img
      src="/favicon-192.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-lg object-contain", className)}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
