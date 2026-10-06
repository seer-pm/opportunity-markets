import type { ReactNode } from 'react';

interface TradeNoticeProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Blocking trade problem shown inside the trade plaque. The headline names the
 * problem in a light red that stays legible on the dark ground; the body
 * carries the recovery in Paper so it reads like copy, not like an alarm.
 */
export function TradeNotice({ title, children, className = '' }: TradeNoticeProps) {
  return (
    <div
      role="alert"
      className={`trade-notice flex gap-3 rounded-control border border-down/35 bg-down/10 px-3.5 py-3 ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-px h-[18px] w-[18px] flex-shrink-0 text-down-ink"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 6.25v4.5" />
        <path d="M10 13.6v.15" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-down-ink">
          {title}
        </p>
        {children ? (
          <p className="mt-1 break-words text-[13px] leading-relaxed text-paper/85">
            {children}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default TradeNotice;
