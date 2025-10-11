"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible input with label, description, and error text.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Helper text displayed below the input */
  description?: string;
  /** Error message; sets aria-invalid and id wiring */
  error?: string;
  /** Optional id; will be generated if absent to correctly associate with label */
  id?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, error, id: providedId, className, ...rest }, ref) => {
    const id = React.useId();
    const inputId = providedId ?? `input-${id}`;
    const descId = description ? `${inputId}-desc` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 text-sm font-medium text-[--text]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          className="input"
          {...rest}
        />
        {description && (
          <p id={descId} className="mt-1 text-xs text-[--muted]">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-[--error]">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
