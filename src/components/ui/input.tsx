import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[40px] w-full rounded-md border border-border bg-surface px-12 py-8 text-body text-textPrimary transition-colors placeholder:text-textMuted focus-visible:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#FF3B30] focus-visible:border-[#FF3B30]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
