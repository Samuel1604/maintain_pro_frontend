import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { BrandMark } from "@/components/brand/BrandMark";
import { APP_NAME } from "@/utils/constants";
import { cn } from "@/utils/helpers";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconSize?: number;
  showText?: boolean;
  asLink?: boolean;
  to?: string;
  /** Renders the full MaintainPro wordmark lockup (icon + name + tagline) instead of the compact mark + text. */
  boxedIcon?: boolean;
  children?: ReactNode;
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName = "font-headline-lg text-headline-lg font-bold text-primary",
  iconSize = 32,
  showText = true,
  asLink = true,
  to = "/",
  boxedIcon = false,
}: BrandLogoProps) {
  const content = boxedIcon ? (
    <BrandWordmark className={cn("h-16 w-auto", iconClassName)} />
  ) : (
    <>
      <BrandMark size={iconSize} className={iconClassName} />
      {showText ? <span className={textClassName}>{APP_NAME}</span> : null}
    </>
  );

  if (!asLink) {
    return <div className={cn("flex items-center gap-2", className)}>{content}</div>;
  }

  return (
    <Link
      to={to}
      aria-label={`${APP_NAME} home`}
      className={cn(
        "inline-flex w-fit items-center gap-2 transition-opacity hover:opacity-90",
        className,
      )}
    >
      {content}
    </Link>
  );
}

/**
 * Full MaintainPro logo lockup (icon + wordmark + tagline).
 * Swaps automatically with the active theme via Tailwind's `dark:` class strategy.
 */
function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block h-16", className)}>
      <img
        src="/logo-light.png"
        alt={APP_NAME}
        className="block h-full w-auto object-contain dark:hidden"
      />
      <img
        src="/logo-dark.png"
        alt={APP_NAME}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  );
}
