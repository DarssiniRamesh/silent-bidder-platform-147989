"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Button component with Ocean Professional styling.
 * - Keyboard accessible, proper focus-visible styles, disabled state, and reduced motion support.
 * - Variants: primary, secondary, outline, ghost, danger.
 * - Sizes: sm, md, lg.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Optional leading icon */
  leftIcon?: React.ReactNode;
  /** Optional trailing icon */
  rightIcon?: React.ReactNode;
  /** Full width button */
  block?: boolean;
}

const base =
  "btn select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--ring]";

const sizeMap: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-[--primary] text-white hover:brightness-95 active:brightness-90 shadow-sm",
  secondary:
    "bg-[--secondary] text-[#1f2937] hover:brightness-95 active:brightness-90 shadow-sm",
  outline:
    "bg-transparent border border-[--border] text-[--text] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]",
  ghost:
    "bg-transparent text-[--text] hover:bg-[#f3f4f6] active:bg-[#e5e7eb]",
  danger:
    "bg-[--error] text-white hover:brightness-95 active:brightness-90 shadow-sm",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", leftIcon, rightIcon, className, block, disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cx(
          base,
          sizeMap[size],
          variantMap[variant],
          block ? "w-full" : undefined,
          "rounded-[var(--radius-md)] transition",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        disabled={disabled}
        {...rest}
      >
        {leftIcon ? <span aria-hidden="true" className="inline-flex">{leftIcon}</span> : null}
        <span>{children}</span>
        {rightIcon ? <span aria-hidden="true" className="inline-flex">{rightIcon}</span> : null}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
