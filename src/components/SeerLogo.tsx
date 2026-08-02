import * as React from 'react';

export interface SeerLogoProps {
  readonly className?: string;
  /** Full wordmark (bird + SEER) vs mark-only crop */
  readonly variant?: 'wordmark' | 'mark';
  readonly title?: string;
}

export const SeerLogo: React.FC<SeerLogoProps> = ({
  className = '',
  variant = 'wordmark',
  title = 'Seer',
}) => {
  if (variant === 'mark') {
    return (
      <img
        src="/seer-mark.png"
        alt={title}
        width={32}
        height={32}
        className={`h-8 w-8 object-contain object-left ${className}`}
        decoding="async"
      />
    );
  }

  return (
    <>
      <img
        src="/seer-mark.png"
        alt=""
        width={32}
        height={32}
        className={`h-8 w-8 object-contain object-left sm:hidden ${className}`}
        decoding="async"
        aria-hidden
      />
      <img
        src="/seer-logo.png"
        alt={title}
        width={138}
        height={64}
        className={`hidden h-8 w-auto object-contain object-left sm:block sm:h-9 ${className}`}
        decoding="async"
      />
    </>
  );
};

export default SeerLogo;
