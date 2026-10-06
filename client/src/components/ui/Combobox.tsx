import { Check, ChevronDown, Plus } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { FieldShell } from './Field';
import { usePopoverPosition } from './usePopoverPosition';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  wrapperClassName?: string;
}

export const Combobox = ({
  value,
  onChange,
  options,
  label,
  error,
  hint,
  required,
  placeholder,
  wrapperClassName,
}: ComboboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const inputId = useId();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.toLowerCase().includes(term));
  }, [options, value]);

  const isNewValue =
    value.trim().length > 0 &&
    !options.some((option) => option.toLowerCase() === value.trim().toLowerCase());

  const position = usePopoverPosition(inputRef, open, matches.length + (isNewValue ? 1 : 0));

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!inputRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (open) {
        event.stopPropagation();
        setOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + delta;
        if (next < 0) return matches.length - 1;
        if (next >= matches.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter' && open && activeIndex >= 0) {
      const option = matches[activeIndex];
      if (option) {
        event.preventDefault();
        select(option);
      }
    }
  };

  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      htmlFor={inputId}
      className={cn('relative', wrapperClassName)}
    >
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'h-10 w-full rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink-900 transition-colors',
            'placeholder:text-ink-300 hover:border-brand-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
            error && 'border-brand-700',
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Show departments"
          onClick={() => {
            setOpen((current) => !current);
            inputRef.current?.focus();
          }}
          className="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-ink-300 transition-colors hover:text-brand-500"
        >
          <ChevronDown
            className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {open && position
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                transform: position.placement === 'top' ? 'translateY(-100%)' : undefined,
              }}
              className="z-[60]"
            >
              <ul
                id={listId}
                role="listbox"
                className="scroll-area max-h-56 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-float"
              >
                {matches.map((option, index) => (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option === value}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(option)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        index === activeIndex ? 'bg-brand-50' : 'bg-transparent',
                        option === value ? 'font-medium text-brand-700' : 'text-ink-700',
                      )}
                    >
                      <span className="flex-1 truncate">{option}</span>
                      {option === value ? (
                        <Check className="size-4 shrink-0 text-brand-600" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                ))}

                {isNewValue ? (
                  <li className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-500">
                    <Plus className="size-3.5 shrink-0 text-mint-600" aria-hidden />
                    <span className="truncate">
                      Add <span className="font-medium text-ink-900">{value.trim()}</span> as a new
                      department
                    </span>
                  </li>
                ) : null}

                {matches.length === 0 && !isNewValue ? (
                  <li className="px-2.5 py-2 text-sm text-ink-300">No departments yet</li>
                ) : null}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </FieldShell>
  );
};
