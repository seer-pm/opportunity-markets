import * as React from 'react';

export interface FooterProps {
  readonly className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`mt-auto border-t border-paper/10 bg-wall ${className}`}
    >
      <div className="mx-auto flex w-full max-w-shell flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row lg:px-10">
        <p className="font-display text-sm font-semibold tracking-tight text-paper">
          Opportunity <span className="text-up">Markets</span>
        </p>
        <a
          href="https://app.seer.pm"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
        >
          Built on Seer
        </a>
      </div>
    </footer>
  );
};

export default Footer;
