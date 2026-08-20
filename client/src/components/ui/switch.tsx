"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  "peer focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      uncheckedTone: {
        default:
          "data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        info: "data-[state=unchecked]:bg-state-info",
        success: "data-[state=unchecked]:bg-state-success",
        warning: "data-[state=unchecked]:bg-state-warning",
        danger: "data-[state=unchecked]:bg-state-danger",
      },
      checkedTone: {
        default: "data-[state=checked]:bg-primary",
        info: "data-[state=checked]:bg-state-info",
        success: "data-[state=checked]:bg-state-success",
        warning: "data-[state=checked]:bg-state-warning",
        danger: "data-[state=checked]:bg-state-danger",
      },
    },
    defaultVariants: {
      uncheckedTone: "default",
      checkedTone: "default",
    },
  },
);

const switchThumbVariants = cva(
  "bg-background pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
  {
    variants: {
      tone: {
        default:
          "dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
        semantic:
          "data-[state=unchecked]:bg-white data-[state=checked]:bg-white",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, uncheckedTone, checkedTone, ...props }: SwitchProps) {
  const isSemantic = uncheckedTone !== undefined || checkedTone !== undefined;

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        switchVariants({ uncheckedTone, checkedTone }),
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          switchThumbVariants({
            tone: isSemantic ? "semantic" : "default",
          }),
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
