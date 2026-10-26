import * as React from 'react';
import { createPortal } from 'react-dom';
import { imageNeedsLightBackground } from '../utils/imageNeedsLightBackground';
import type { SubmissionDetail } from '../config/submissions';

export type SubmissionLightboxProps = {
  readonly open: boolean;
  readonly title: string;
  readonly images: readonly { name: string; url: string }[];
  /** Submitted text shown under the images. */
  readonly detail?: SubmissionDetail;
  /** Browse to the neighbouring entry (buttons and arrow keys). */
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
  /** e.g. "3 / 58", shown between the browse buttons. */
  readonly position?: string;
  readonly onClose: () => void;
};

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}…]+$/;
const X_HANDLE = /^[A-Za-z0-9_]{1,15}$/;

const textLinkClass =
  'break-all text-up underline decoration-up/40 underline-offset-[3px] transition-colors hover:decoration-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up';

/** Plain text with http(s) URLs turned into links. Never renders the text as HTML. */
function LinkifiedText({ text }: { readonly text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        // `split` with a capture group puts the URLs at odd indexes.
        if (i % 2 === 0) return <React.Fragment key={i}>{part}</React.Fragment>;
        const trailing = part.match(TRAILING_PUNCTUATION)?.[0] ?? '';
        const href = trailing ? part.slice(0, -trailing.length) : part;
        return (
          <React.Fragment key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={textLinkClass}
            >
              {href}
            </a>
            {trailing}
          </React.Fragment>
        );
      })}
    </>
  );
}

function DetailMeta({
  title,
  detail,
}: {
  readonly title: string;
  readonly detail: SubmissionDetail;
}) {
  const author = detail.author?.replace(/^@/, '');
  return (
    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
      {detail.title !== title ? (
        <span className="normal-case tracking-normal">{detail.title}</span>
      ) : null}
      {author ? (
        X_HANDLE.test(author) ? (
          <a
            href={`https://x.com/${author}`}
            target="_blank"
            rel="noopener noreferrer"
            className="normal-case tracking-normal transition-colors hover:text-up"
          >
            @{author}
          </a>
        ) : (
          <span className="normal-case tracking-normal">@{author}</span>
        )
      ) : null}
      {detail.source && detail.sourceUrl ? (
        <a
          href={detail.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-up"
        >
          {detail.source} ↗
        </a>
      ) : detail.source ? (
        <span>{detail.source}</span>
      ) : null}
    </p>
  );
}

function ChevronIcon({ direction }: { readonly direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M10 3.5L5.5 8 10 12.5' : 'M6 3.5L10.5 8 6 12.5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const headerButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-paper/15 text-paper transition-colors hover:border-up/40 hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l9 9M13.5 4.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PortfolioImage({
  url,
  alt,
}: {
  readonly url: string;
  readonly alt: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const [retryKey, setRetryKey] = React.useState(0);
  // Hosts without CORS headers refuse `crossOrigin` loads; retry without it
  // and give up the light-background check for that image.
  const [cors, setCors] = React.useState(true);
  const [needsLightBg, setNeedsLightBg] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const resolveLightBg = React.useCallback((img: HTMLImageElement) => {
    setNeedsLightBg(imageNeedsLightBackground(img));
  }, []);

  React.useEffect(() => {
    setFailed(false);
    setCors(true);
    setNeedsLightBg(false);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      resolveLightBg(img);
    }
  }, [url, retryKey, resolveLightBg]);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <p className="text-base text-paper">Could not load this image.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setRetryKey((k) => k + 1);
          }}
          className="rounded-control bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        needsLightBg
          ? 'overflow-hidden rounded-panel bg-white p-4 sm:p-6'
          : undefined
      }
    >
      <img
        key={`${url}-${retryKey}-${cors}`}
        ref={imgRef}
        src={url}
        alt={alt}
        crossOrigin={cors ? 'anonymous' : undefined}
        className="mx-auto h-auto w-full max-w-full"
        onLoad={(event) => {
          if (cors) resolveLightBg(event.currentTarget);
        }}
        onError={() => {
          if (cors) {
            setCors(false);
            return;
          }
          setFailed(true);
          setNeedsLightBg(false);
        }}
      />
    </div>
  );
}

export function SubmissionLightbox({
  open,
  title,
  images,
  detail,
  onPrev,
  onNext,
  position,
  onClose,
}: SubmissionLightboxProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  // Read by the keydown listener so it doesn't re-subscribe (and steal focus)
  // whenever a parent passes new inline handlers, e.g. while browsing.
  const handlersRef = React.useRef({ onPrev, onNext, onClose });
  React.useEffect(() => {
    handlersRef.current = { onPrev, onNext, onClose };
  });

  const count = images.length;

  React.useEffect(() => {
    if (open) scrollRef.current?.scrollTo(0, 0);
  }, [open, title]);

  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handlersRef.current.onClose();
        return;
      }
      const browse =
        event.key === 'ArrowLeft'
          ? handlersRef.current.onPrev
          : event.key === 'ArrowRight'
            ? handlersRef.current.onNext
            : undefined;
      if (browse) {
        event.preventDefault();
        browse();
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open || (count === 0 && !detail)) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-wall/92 p-4 sm:p-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={detail ? `${title} submission` : `${title} images`}
        className="lot-panel relative flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden shadow-panel"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-edge px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-semibold text-paper">
              {title}
            </h2>
            {detail ? <DetailMeta title={title} detail={detail} /> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onPrev && onNext ? (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  className={headerButtonClass}
                  aria-label="Previous design"
                >
                  <ChevronIcon direction="left" />
                </button>
                {position ? (
                  <span className="hidden font-mono text-xs tabular-nums text-muted sm:inline">
                    {position}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={onNext}
                  className={headerButtonClass}
                  aria-label="Next design"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            ) : null}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className={headerButtonClass}
              aria-label={detail ? 'Close submission' : 'Close images'}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-wall"
        >
          {count > 0 ? (
            <ul className="flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8">
              {images.map((image, i) => (
                <li key={image.url} className="list-none">
                  <PortfolioImage
                    url={image.url}
                    alt={`${title}, image ${i + 1} of ${count}`}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {detail ? (
            <div
              className={`px-4 py-6 sm:px-8 sm:py-8 ${count > 0 ? 'border-t border-edge' : ''}`}
            >
              <p className="max-w-prose whitespace-pre-line break-words text-sm leading-relaxed text-paper/90">
                <LinkifiedText text={detail.description} />
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SubmissionLightbox;
