import type { DocLink } from "@/lib/resources";

/** Official doc links with their source shown, so customers can see where answers come from. */
export function DocLinkList({ links, heading }: { links: DocLink[]; heading?: string }) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3">
      {heading && <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">{heading}</p>}
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.url}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
            >
              <DocIcon />
              <span>
                {l.title}
                <span className="ml-1.5 font-normal text-ink-faint">{new URL(l.url).host}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0" aria-hidden>
      <path
        d="M4 1.75h5.5L13 5.25v8.5c0 .41-.34.75-.75.75h-8.5a.75.75 0 0 1-.75-.75v-11.5c0-.41.34-.75.75-.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M9.25 1.75v3.5h3.5M5.5 8.5h5M5.5 11h3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
