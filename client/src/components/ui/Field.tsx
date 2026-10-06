import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const CONTROL_BASE =
  'w-full rounded-lg border border-line bg-white px-3 text-sm text-ink-900 transition-colors placeholder:text-ink-300 hover:border-brand-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-surface disabled:text-ink-300';

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export const FieldShell = ({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  children,
}: FieldShellProps) => (
  <div className={cn('space-y-1.5', className)}>
    {label ? (
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-700">
        {label}
        {required ? <span className="ml-0.5 text-brand-600">*</span> : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <p className="text-xs font-medium text-brand-800">{error}</p>
    ) : hint ? (
      <p className="text-xs text-ink-500">{hint}</p>
    ) : null}
  </div>
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, wrapperClassName, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={props.required}
        htmlFor={inputId}
        className={wrapperClassName}
      >
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(CONTROL_BASE, 'h-10', error && 'border-brand-700 ring-brand-100', className)}
          {...props}
        />
      </FieldShell>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName, className, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <FieldShell
        label={label}
        error={error}
        hint={hint}
        required={props.required}
        htmlFor={textareaId}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          className={cn(
            CONTROL_BASE,
            'min-h-24 resize-y py-2.5 leading-relaxed',
            error && 'border-brand-700 ring-brand-100',
            className,
          )}
          {...props}
        />
      </FieldShell>
    );
  },
);

Textarea.displayName = 'Textarea';
