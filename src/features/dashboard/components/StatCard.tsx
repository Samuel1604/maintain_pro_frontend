import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/helpers";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Wrench,
  Users,
  Building2,
  Target,
  Calendar,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  changeLabel?: string;
  icon:
    | "work-orders"
    | "clock"
    | "completed"
    | "overdue"
    | "warning"
    | "cost"
    | "assets"
    | "vendors"
    | "users"
    | "facilities"
    | "compliance"
    | "calendar";
  variant?: "default" | "success" | "warning" | "danger";
  href?: string;
}

const iconMap = {
  "work-orders": ClipboardList,
  clock: Clock,
  completed: CheckCircle2,
  overdue: AlertTriangle,
  warning: AlertTriangle,
  cost: DollarSign,
  assets: Wrench,
  vendors: Users,
  users: Users,
  facilities: Building2,
  compliance: Target,
  calendar: Calendar,
};

const changeLabelClass: Record<string, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function useCountUp(target: number, enabled: boolean) {
  const [display, setDisplay] = useState(enabled ? 0 : target);
  const frame = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || target === 0) {
      setDisplay(target);
      return;
    }
    const duration = 500;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, enabled]);
  return display;
}

export function KPICard({
  title,
  value,
  changeLabel,
  icon,
  variant = "default",
  href,
}: KPICardProps) {
  const Icon = iconMap[icon];
  const isPlainNumber = typeof value === "number";
  const animatedValue = useCountUp(isPlainNumber ? value : 0, isPlainNumber);
  const displayValue = isPlainNumber ? animatedValue : value;
  const labelClass = changeLabelClass[variant];
  const showDot = variant !== "default";
  const accent =
    variant === "danger"
      ? "before:bg-danger"
      : variant === "success"
        ? "before:bg-success"
        : variant === "warning"
          ? "before:bg-warning"
          : "before:bg-primary";

  const card = (
    <div
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-(--radius-card) border border-border/80 bg-gradient-to-br from-card via-card to-surface-muted/40 px-5 py-5 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md before:absolute before:inset-y-0 before:left-0 before:w-1",
        accent,
        href && "cursor-pointer",
      )}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-secondary">{title}</span>
        <div
          className={cn(
            "rounded-xl border border-border/70 bg-surface-muted p-2.5",
            variant === "danger"
              ? "text-danger"
              : variant === "success"
                ? "text-success"
                : variant === "warning"
                  ? "text-warning"
                  : "text-primary",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      {/* Value */}
      <p
        className={cn(
          "text-[30px] font-bold leading-none tracking-tight",
          variant === "danger" ? "text-danger" : "text-text-primary",
        )}
      >
        {displayValue}
      </p>

      {/* Sub-label */}
      {changeLabel && (
        <div className="flex items-center gap-1.5">
          {showDot && (
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                labelClass.replace("text-", "bg-"),
              )}
            />
          )}
          <span className={cn("text-[12px]", labelClass)}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
  return href ? (
    <Link to={href} aria-label={`Open ${title}`} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
