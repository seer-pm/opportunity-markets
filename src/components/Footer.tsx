import * as React from 'react';
import { seerApps } from '@seer-pm/ui-kit';
import { EcosystemFooter } from '@seer-pm/ui-kit/react';

export interface FooterProps {
  readonly className?: string;
}
const opportunity = seerApps.find((app) => app.id === 'opportunity')!;
const links = [
  { name: 'Live markets', url: '/#pilot' },
  { name: 'Archive', url: '/archive' },
  { name: 'The protocol', url: '/#protocol' },
];

export const Footer: React.FC<FooterProps> = ({ className = '' }) => (
  <div
    className={`mt-auto [--seer-footer-max-width:1350px] [--seer-footer-gutter:16px] sm:[--seer-footer-gutter:24px] lg:[--seer-footer-gutter:40px] ${className}`}
  >
    <EcosystemFooter
      appName={opportunity.name}
      homeUrl="/"
      tagline={opportunity.summary}
      groups={[{ title: opportunity.name, links }]}
    />
  </div>
);

export default Footer;
