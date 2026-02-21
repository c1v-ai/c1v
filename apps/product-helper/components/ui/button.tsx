import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";;
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium leading-[150%] transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#FCE8CC] text-[#0B2C29] hover:bg-[#F5D9B0] shadow-[var(--shadow-button-primary)]",
        secondary:
          "bg-black/5 text-foreground shadow-[var(--shadow-button-secondary)] hover:bg-black/10 dark:bg-white/15 dark:text-white dark:hover:bg-white/20",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 rounded-xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "bg-transparent text-foreground border-0 hover:bg-black/5 dark:hover:bg-white/10",
        ghost:
          "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/15",
        link: "bg-transparent text-foreground underline-offset-4 hover:underline p-0 h-auto"
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-4",
        sm: "h-10 px-5 py-2 has-[>svg]:px-3",
        lg: "h-12 px-8 py-3 has-[>svg]:px-5",
        icon: "h-11 w-11",
        "icon-sm": "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
