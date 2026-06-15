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
        className={`w-full bg-slate-900 border ${
          error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
        } text-white placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors`}
      />
      {error && <span className="text-red-400 text-xs mt-1.5 ml-1">{error}</span>}
    </div>
  );
}
