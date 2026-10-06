import { Check, ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { FieldShell } from './Field';
import { usePopoverPosition } from './usePopoverPosition';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  dotClass?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  ariaLabel?: string;
  leading?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  onBlur?: () => void;
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  hint,
  required,
  disabled,
  size = 'md',
  ariaLabel,
  leading,
  className,
  wrapperClassName,
  onBlur,
}: SelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const triggerId = useId();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({ term: '', timer: 0 });

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const position = usePopoverPosition(triggerRef, open, options.length);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const commit = useCallback(
    (option: SelectOption) => {
      onChange(option.value);
      close();
      triggerRef.current?.focus();
    },
    [onChange, close],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        close();
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close, onBlur]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    panelRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = (index: number) => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(index >= 0 ? index : Math.max(selectedIndex, 0));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'Escape') {
      if (open) {
        event.stopPropagation();
        close();
      }
      return;
    }

    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openList(event.key === 'ArrowUp' ? options.length - 1 : -1);
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => {
        const next = current + delta;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) commit(option);
      return;
    }

    if (event.key === 'Tab') {
      close();
      return;
    }

    if (event.key.length === 1) {
      window.clearTimeout(typeahead.current.timer);
      typeahead.current.term += event.key.toLowerCase();
      typeahead.current.timer = window.setTimeout(() => {
        typeahead.current.term = '';
      }, 600);

      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(typeahead.current.term),
      );
      if (match >= 0) setActiveIndex(match);
    }
  };

  const trigger = (
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      role="combobox"
      aria-controls={listId}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      aria-invalid={Boolean(error)}
      aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      disabled={disabled}
      onClick={() => (open ? close() : openList(-1))}
      onKeyDown={onKeyDown}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-line bg-white text-left text-ink-900 transition-colors',
        'hover:border-brand-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-300',
        size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm',
        open && 'border-brand-500 ring-2 ring-brand-100',
        error && 'border-brand-700',
        className,
      )}
    >
      {leading}
      {selected?.dotClass ? (
        <span className={cn('size-1.5 shrink-0 rounded-full', selected.dotClass)} aria-hidden />
      ) : null}
      <span className={cn('flex-1 truncate', !selected && 'text-ink-300')}>
        {selected?.label ?? placeholder}
      </span>
      <ChevronDown
        className={cn(
          'shrink-0 text-ink-300 transition-transform duration-150',
          size === 'sm' ? 'size-3.5' : 'size-4',
          open && 'rotate-180 text-brand-500',
        )}
        aria-hidden
      />
    </button>
  );

  const panel =
    open && position
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
              aria-labelledby={triggerId}
              className="scroll-area max-h-64 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-float"
            >
              {options.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-ink-300">No options available</li>
              ) : (
                options.map((option, index) => {
                  const isSelected = option.value === value;

                  return (
                    <li key={option.value || 'empty'}>
                      <button
                        id={`${listId}-${index}`}
                        data-index={index}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => commit(option)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                          index === activeIndex ? 'bg-brand-50' : 'bg-transparent',
                          isSelected ? 'font-medium text-brand-700' : 'text-ink-700',
                        )}
                      >
                        {option.dotClass ? (
                          <span
                            className={cn('size-1.5 shrink-0 rounded-full', option.dotClass)}
                            aria-hidden
                          />
                        ) : null}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{option.label}</span>
                          {option.description ? (
                            <span className="block truncate text-xs text-ink-500">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <Check className="size-4 shrink-0 text-brand-600" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  if (!label && !error && !hint) {
    return (
      <div className={cn('relative', wrapperClassName)}>
        {trigger}
        {panel}
      </div>
    );
  }

  return (
    <FieldShell
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={wrapperClassName}
    >
      {trigger}
      {panel}
    </FieldShell>
  );
};
