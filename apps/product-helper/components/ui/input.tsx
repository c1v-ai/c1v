import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[rgba(13,13,13,0.6)] dark:placeholder:text-[rgba(255,255,255,0.6)] selection:bg-primary selection:text-primary-foreground border-[rgba(13,13,13,0.15)] dark:border-[rgba(255,255,255,0.2)] flex h-10 w-full min-w-0 rounded-xl border bg-black/5 dark:bg-white/15 px-3 py-2 text-base leading-[150%] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
