import * as React from 'react';
import { SeerLogo } from './SeerLogo';

export interface FooterProps {
  readonly className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`mt-auto border-t border-edge bg-wall ${className}`}
    >
      <div className="mx-auto flex w-full max-w-shell flex-col gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <a
          href="https://seer.pm"
          target="_blank"
          rel="noreferrer"
          aria-label="Seer"
          className="inline-flex w-fit items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
        >
          <SeerLogo />
        </a>
        <p className="text-sm leading-relaxed text-muted sm:text-right">
          Opportunity Markets on Seer.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
