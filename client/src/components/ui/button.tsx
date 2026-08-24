import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { semanticColorVars, type SemanticColor } from "@/lib/semantic-colors";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        solid:
          "bg-[var(--ui-surface)] text-[var(--ui-foreground)] hover:opacity-90",
        outline:
          "border border-[var(--ui-border)] bg-transparent text-[var(--ui-color)] shadow-xs hover:bg-[var(--ui-muted)]",
        ghost:
          "bg-transparent text-[var(--ui-color)] hover:bg-[var(--ui-muted)]",
        link:
          "bg-transparent text-[var(--ui-color)] underline-offset-4 hover:underline",
      },

      color: semanticColorVars,

      size: {
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        "icon-sm": "size-8",
        "icon-md": "size-9",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "solid",
  color="primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-color={color}
      data-size={size}
      className={cn(buttonVariants({ variant, color, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
