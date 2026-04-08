import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-sm px-8 py-[2px] text-[12px] font-medium transition-colors";
  
  const variants = {
    default: "bg-border text-textPrimary",
    success: "bg-[#34C759]/10 text-[#34C759] dark:bg-[#32D74B]/20 dark:text-[#32D74B]",
    warning: "bg-[#FF9500]/10 text-[#FF9500] dark:bg-[#FF9F0A]/20 dark:text-[#FF9F0A]",
    danger: "bg-[#FF3B30]/10 text-[#FF3B30] dark:bg-[#FF453A]/20 dark:text-[#FF453A]",
    info: "bg-accent/10 text-accent",
    outline: "text-textPrimary border border-border",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

export { Badge };
