import { cn } from "@/lib/cn";

/** App name with a small speech-bubble mark. Our own design, no third-party logos. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" className="size-6 text-accent" aria-hidden>
        <path
          d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6a3.5 3.5 0 0 1-3.5 3.5H11l-4.5 4v-4A3.5 3.5 0 0 1 4 12.5v-6Z"
          fill="currentColor"
        />
        <path
          d="M10 8.2a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.4"
          fill="none"
          stroke="white"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <circle cx="12" cy="13.2" r="0.9" fill="white" />
      </svg>
      Okay, Now What?
    </span>
  );
}
