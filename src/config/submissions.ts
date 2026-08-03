import ipfsManifest from '../../submissions/ipfs-manifest.json';
import { getMarketOverride } from './market';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;
const PDF_EXT = /\.pdf$/i;

const DEFAULT_IPFS_GATEWAY = 'https://cdn.kleros.link';

export type ManifestFile = {
  name: string;
  localPath: string;
  ipfsPath: string;
};

export type SubmissionAssets = {
  submissionId: string;
  images: { name: string; url: string }[];
  pdfUrl?: string;
};

type Manifest = {
  markets: Record<string, Record<string, ManifestFile[]>>;
};

const manifest = ipfsManifest as Manifest;

function ipfsGatewayBase(): string {
  const fromEnv = import.meta.env.VITE_IPFS_GATEWAY?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_IPFS_GATEWAY;
  return base.replace(/\/$/, '');
}

export function ipfsUrl(ipfsPath: string): string {
  const path = ipfsPath.startsWith('/') ? ipfsPath : `/${ipfsPath}`;
  return `${ipfsGatewayBase()}${path}`;
}

function findSubmissionFiles(
  marketKey: string,
  submissionId: string
): ManifestFile[] | undefined {
  return manifest.markets[marketKey]?.[submissionId];
}

function resolveSubmissionId(
  marketKey: string,
  outcomeTitle: string,
  explicit?: Record<string, string>
): string | undefined {
  const title = outcomeTitle.trim();

  const mapped = explicit?.[title] ?? explicit?.[outcomeTitle];
  if (mapped && findSubmissionFiles(marketKey, mapped)) {
    return mapped;
  }

  const submissions = manifest.markets[marketKey];
  if (!submissions) return undefined;

  if (submissions[title]) return title;
  if (submissions[outcomeTitle]) return outcomeTitle;

  const lower = title.toLowerCase();
  const ci = Object.keys(submissions).find((id) => id.toLowerCase() === lower);
  return ci;
}

export function getOutcomeSubmissionAssets(
  marketId: string,
  outcomeTitle: string
): SubmissionAssets | undefined {
  const override = getMarketOverride(marketId);
  const marketKey = override?.submissionsMarket;
  if (!marketKey) return undefined;

  const submissionId = resolveSubmissionId(
    marketKey,
    outcomeTitle,
    override.submissions
  );
  if (!submissionId) return undefined;

  const files = findSubmissionFiles(marketKey, submissionId);
  if (!files?.length) return undefined;

  const images = files
    .filter((f) => IMAGE_EXT.test(f.name))
    .map((f) => ({ name: f.name, url: ipfsUrl(f.ipfsPath) }));

  const pdf = files.find((f) => PDF_EXT.test(f.name));

  if (images.length === 0 && !pdf) return undefined;

  return {
    submissionId,
    images,
    pdfUrl: pdf ? ipfsUrl(pdf.ipfsPath) : undefined,
  };
}
