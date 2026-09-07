import type { ReactElement, ReactNode } from 'react';

function IconSvg({ children }: { children: ReactNode }): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

export function ChevronUpIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function ChevronDownIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function ChevronLeftIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function ChevronRightIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function MapIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M2 4.5l4-1.5 4 1.5 4-1.5v9l-4 1.5-4-1.5-4 1.5v-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 3v9M10 4.5v9" stroke="currentColor" strokeWidth="1.4" />
    </IconSvg>
  );
}

export function TableIcon(): ReactElement {
  return (
    <IconSvg>
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 7h12M6 3v10M10 3v10" stroke="currentColor" strokeWidth="1.4" />
    </IconSvg>
  );
}

export function InfoIcon(): ReactElement {
  return (
    <IconSvg>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconSvg>
  );
}

export function ChatIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M3 4.5h10a1.5 1.5 0 011.5 1.5v4A1.5 1.5 0 0113 11.5H6l-3 2.5V4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function SendIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M3 8l10-5-2.5 10-2-3.5L3 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function DetailsIcon(): ReactElement {
  return (
    <IconSvg>
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 5.5h4M6 8h4M6 10.5h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconSvg>
  );
}

export function MetricsIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M3 12V8M7 12V5M11 12V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconSvg>
  );
}

export function DraftIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M4 2.5h6l3 3v8.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 2.5V5.5h3M6 9h4M6 11.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </IconSvg>
  );
}

export function ShareIcon(): ReactElement {
  return (
    <IconSvg>
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.8 7.2l4.4-2.4M5.8 8.8l4.4 2.4" stroke="currentColor" strokeWidth="1.4" />
    </IconSvg>
  );
}

export function CloseIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconSvg>
  );
}

export function CheckIcon(): ReactElement {
  return (
    <IconSvg>
      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </IconSvg>
  );
}
