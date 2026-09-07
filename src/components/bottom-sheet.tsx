import { useEffect, type ReactElement, type ReactNode } from 'react';
import { CloseIcon } from './ui-icons';

export function BottomSheet({
  title,
  onClose,
  children,
  labelledBy = 'bottom-sheet-title'
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}): ReactElement {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="inspector-backdrop" role="presentation" onClick={onClose}>
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="bottom-sheet-header">
          <h2 id={labelledBy}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>
        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  );
}
