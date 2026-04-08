import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-accent text-white hover:bg-accentHover border border-transparent shadow-sm",
      secondary: "bg-surfaceSecondary text-textPrimary hover:bg-hover border border-border",
      outline: "border border-border bg-transparent hover:bg-hover text-textPrimary",
      ghost: "hover:bg-hover text-textPrimary hover:text-textPrimary",
      danger: "bg-[#FF3B30] text-white hover:bg-[#FF453A] border border-transparent",
    };

    const sizes = {
      sm: "h-[32px] px-12 text-caption",
      md: "h-[40px] px-16",
      lg: "h-[48px] px-24 text-[16px]",
      icon: "h-[40px] w-[40px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-8 inline-block h-16 w-16 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
