import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-surface px-12 py-8 text-body text-textPrimary transition-colors placeholder:text-textMuted focus-visible:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          error && "border-[#FF3B30] focus-visible:border-[#FF3B30]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
