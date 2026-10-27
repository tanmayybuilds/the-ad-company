import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { company } from "@/content/site";
import { companyLogo } from "@/lib/logo";

export const actionVariants = cva(
  "group/action inline-flex items-center justify-center gap-3 border-2 border-ink font-ui font-bold uppercase tracking-[.04em] transition-[transform,box-shadow,background-color,color] duration-200 ease-out select-none active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none aria-disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        /** Teal fill, gold on hover. */
        ink: "bg-brand text-on-inverse shadow-hard hover:bg-orange hover:text-on-accent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md active:shadow-hard-xs",
        /** Gold action with a contrasting label in every theme. */
        signal:
          "bg-orange text-on-accent shadow-hard-sm hover:bg-brand hover:text-on-inverse hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-md active:shadow-hard-xs",
        outline: "bg-transparent text-ink hover:bg-brand hover:text-on-inverse",
        /** On gold backgrounds. */
        inkOnSignal: "bg-brand text-on-inverse shadow-hard-ivory hover:bg-inverse hover:text-on-inverse",
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

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "ivory" }) {
  return <span className={cn("company-logo", tone === "ivory" && "company-logo-footer")}>
    <img src={companyLogo.src} width={companyLogo.width} height={companyLogo.height} alt={company.name} decoding="async" />
  </span>;
}
