import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldChildProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: "true";
  "aria-required"?: "true";
};

type FieldProps = {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  children: (props: FieldChildProps) => ReactNode;
};

export function Field({ label, error, helper, required, className, labelClassName, children }: FieldProps) {
  const baseId = useId();
  const helperId = helper ? `${baseId}-helper` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  const childProps: FieldChildProps = {
    id: baseId,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(error ? { "aria-invalid": "true" as const } : {}),
    ...(required ? { "aria-required": "true" as const } : {}),
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={baseId} className={cn("text-sm font-semibold text-text", labelClassName)}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-error ml-1">
            *
          </span>
        )}
      </label>

      {children(childProps)}

      {helper && !error && (
        <p id={helperId} className="text-xs text-muted">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
