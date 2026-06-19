"use client";

import { ComponentProps } from "react";

interface FormInputProps extends ComponentProps<"input"> {
  error?: string;
}

export default function FormInput({ error, className = "", ...props }: FormInputProps) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <input
        {...props}
        className={`w-full bg-surface-muted border ${
          error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-surface-border focus:border-primary focus:ring-primary/20"
        } text-foreground placeholder-slate-400 dark:placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 transition-all duration-200`}
      />
      {error && <span className="text-danger text-xs mt-1.5 ml-1 font-medium">{error}</span>}
    </div>
  );
}
