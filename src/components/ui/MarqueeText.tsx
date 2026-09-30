import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/utils/helpers";

interface MarqueeTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /**
   * 'hover': scroll smoothly only when the parent element is hovered (recommended for clean UI)
   * 'always': continuous smooth horizontal marquee animation
   */
  mode?: "hover" | "always";
}

/**
 * MarqueeText component:
 * Detects if the inner text content exceeds the parent container width.
 * When overflowing, seamlessly scrolls text in-and-out on hover (or continuously)
 * instead of hard-clipping with ellipsis `...`.
 */
export function MarqueeText({ children, className, mode = "hover", ...props }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        if (contentWidth > containerWidth) {
          setIsOverflowing(true);
          setScrollDistance(contentWidth - containerWidth + 8); // 8px buffer for edge breathing
        } else {
          setIsOverflowing(false);
          setScrollDistance(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn("group/marquee relative overflow-hidden whitespace-nowrap", className)}
      {...props}
    >
      <div
        ref={contentRef}
        className={cn(
          "inline-block transition-transform ease-in-out",
          isOverflowing &&
            mode === "hover" &&
            "group-hover/marquee:-translate-x-[var(--scroll-dist)] duration-[2500ms]",
          isOverflowing && mode === "always" && "animate-marquee-bounce",
        )}
        style={
          isOverflowing && mode === "hover"
            ? ({ "--scroll-dist": `${scrollDistance}px` } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
