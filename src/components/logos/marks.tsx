import type { SeedLogoId } from "@/lib/logos";

// Hand-drawn marks for the three fictional demo companies. Drawn on a 32 x 32 grid as app-style
// tiles, so they sit naturally in lists, headers, and the customer portal. Not real brands.

function Harborline({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c4f8c" />
          <stop offset="1" stopColor="#0d2a4f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-bg)`} />
      {/* Harbor arch */}
      <path d="M9 18.5a7 7 0 0 1 14 0" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 11.5v3" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      {/* Waves */}
      <path
        d="M7 22c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.5 25.5c1.1-.9 2.2-.9 3.3 0s2.2.9 3.3 0 2.2-.9 3.3 0 2.2.9 3.3 0"
        fill="none"
        stroke="#7dd3fc"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
}

function Copperleaf({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d0743a" />
          <stop offset="1" stopColor="#8f3d16" />
        </linearGradient>
        <linearGradient id={`${id}-leaf`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#fde7d3" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-bg)`} />
      <path d="M9 23.5C9 14.5 14.5 8.8 24 8c-.3 9.6-6.2 15.2-15 15.5Z" fill={`url(#${id}-leaf)`} />
      <path d="M9.6 22.9 20.2 12.3" stroke="#b5531f" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.2 19.3h3.9M15.9 16.6h3" stroke="#b5531f" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9.6 22.9 7.6 24.9" stroke="#fde7d3" strokeWidth="1.6" strokeLinecap="round" />
    </>
  );
}

function Bluestone({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d5f93" />
          <stop offset="1" stopColor="#1d3358" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-bg)`} />
      {/* Faceted shield: lighter right facet, darker left facet */}
      <path d="M16 6.8 23.6 9.6v6c0 4.6-3.2 8-7.6 9.6Z" fill="#e8eff9" />
      <path d="M16 6.8 8.4 9.6v6c0 4.6 3.2 8 7.6 9.6Z" fill="#b9cbe6" />
      <path d="M8.4 9.6 16 15.4l7.6-5.8" fill="none" stroke="#2a4677" strokeOpacity="0.55" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M16 15.4v9.8" stroke="#2a4677" strokeOpacity="0.4" strokeWidth="1.1" />
    </>
  );
}

const MARKS: Record<SeedLogoId, (p: { id: string }) => React.ReactNode> = {
  harborline: Harborline,
  copperleaf: Copperleaf,
  bluestone: Bluestone,
};

export function SeedMark({ logoId, id }: { logoId: SeedLogoId; id: string }) {
  const Mark = MARKS[logoId];
  return <Mark id={id} />;
}
