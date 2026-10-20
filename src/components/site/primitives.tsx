import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { company } from "@/content/site";

export const actionVariants = cva(
  "group/action inline-flex items-center justify-center gap-3 border-2 border-ink font-display font-bold uppercase tracking-wider transition-[transform,box-shadow,background-color,color] duration-200 ease-out select-none active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none aria-disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        /** Charcoal fill → orange on hover. */
        ink: "bg-ink text-ivory shadow-hard hover:bg-orange hover:text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md active:shadow-hard-xs",
        /** Electric orange → acid lime on hover. */
        signal:
          "bg-orange text-ink shadow-hard-sm hover:bg-lime hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md active:shadow-hard-xs",
        outline: "bg-transparent text-ink hover:bg-ink hover:text-ivory",
        /** On orange backgrounds. */
        inkOnSignal: "bg-ink text-ivory shadow-hard-ivory hover:bg-lime hover:text-ink",
        disabled: "border-ink/40 bg-transparent text-ink/70 border-dashed",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3.5 text-sm",
        lg: "px-7 py-4 text-[0.95rem]",
      },
    },
    defaultVariants: { variant: "ink", size: "lg" },
  },
);

type ActionVariants = VariantProps<typeof actionVariants>;

export function Arrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block transition-transform duration-200 ease-out group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5",
        className,
      )}
    >
      ↗
    </span>
  );
}

export function ActionLink({
  className,
  variant,
  size,
  children,
  arrow = true,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & ActionVariants & { arrow?: boolean }) {
  return (
    <a className={cn(actionVariants({ variant, size }), className)} {...props}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </a>
  );
}

export function ActionButton({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ActionVariants) {
  return (
    <button className={cn(actionVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

/** Monospaced editorial index caption, e.g. [03 // SERVICES]. */
export function Eyebrow({
  children,
  tone = "signal",
  className,
}: {
  children: ReactNode;
  tone?: "signal" | "lime" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-label-index block tracking-widest",
        tone === "signal" && "text-signal",
        tone === "lime" && "text-lime",
        tone === "ink" && "text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("h-8 w-8 shrink-0", className)}
      focusable="false"
    >
      <rect width="32" height="32" fill="var(--ink)" />
      <path
        d="M10 22 L22 10 M13 10 H22 V19"
        fill="none"
        stroke="var(--lime)"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Wordmark({ tone = "ink", tag = true }: { tone?: "ink" | "ivory"; tag?: boolean }) {
  return (
    <span className="flex items-center gap-2 sm:gap-3">
      <LogoMark />
      <span
        className={cn(
          "font-display text-sm font-extrabold uppercase leading-none tracking-tight sm:text-xl",
          tone === "ink" ? "text-ink" : "text-ivory",
        )}
      >
        {company.wordmark}
      </span>
      {tag && (
        <span className="text-label-index hidden border border-ink/15 px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground xl:inline-block">
          [OOH·IN]
        </span>
      )}
    </span>
  );
}
