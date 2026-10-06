import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom';
}

const GAP = 6;
const MAX_PANEL_HEIGHT = 272;

export const usePopoverPosition = (
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  itemCount: number,
) => {
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const estimated = Math.min(itemCount * 40 + 8, MAX_PANEL_HEIGHT);
      const spaceBelow = window.innerHeight - rect.bottom - GAP;
      const spaceAbove = rect.top - GAP;
      const placement = spaceBelow < estimated && spaceAbove > spaceBelow ? 'top' : 'bottom';

      setPosition({
        top: placement === 'bottom' ? rect.bottom + GAP : rect.top - GAP,
        left: rect.left,
        width: rect.width,
        placement,
      });
    };

    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, itemCount, triggerRef]);

  useEffect(() => {
    if (!open) setPosition(null);
  }, [open]);

  return position;
};
