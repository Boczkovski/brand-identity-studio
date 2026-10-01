import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 border-2 border-foreground px-5 text-center text-sm font-bold uppercase transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90",
        whatsapp: "bg-success text-success-foreground hover:-translate-y-0.5 hover:bg-success/90",
        outline: "bg-transparent text-foreground hover:bg-foreground hover:text-background",
      },
      size: {
        default: "min-h-12",
        large: "min-h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
