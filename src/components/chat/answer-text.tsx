import Link from "next/link";
import { isCatalogUrl } from "@/lib/ai/format";

// A deliberately small formatter for Ask answers: paragraphs, numbered lists (with
// sub-bullets), bullet lists, **bold**, `code`, and links. External links render only when they
// point at the verified doc catalog; internal links (rep chat) only when they are on the allowlist
// passed in. No HTML from the model is ever injected.

function inline(text: string, keyBase: string, internal?: ReadonlySet<string>): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      parts.push(<strong key={key}>{m[1]}</strong>);
    } else if (m[2]) {
      parts.push(
        <code key={key} className="rounded bg-surface-strong px-1 py-0.5 font-mono text-[0.85em]">
          {m[2]}
        </code>,
      );
    } else if (m[3] && m[4] && m[4].startsWith("/")) {
      parts.push(
        internal?.has(m[4].split("#")[0]) ? (
          <Link key={key} href={m[4]} className="font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent">
            {m[3]}
          </Link>
        ) : (
          m[3]
        ),
      );
    } else if (m[3] && m[4]) {
      parts.push(
        isCatalogUrl(m[4]) ? (
          <a
            key={key}
            href={m[4]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
          >
            {m[3]}
          </a>
        ) : (
          m[3]
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "code"; lines: string[]; open: boolean }
  | { kind: "ol"; items: { text: string; subs: string[] }[] }
  | { kind: "ul"; items: string[] };

const NUMBERED = /^\s*\d+[.)]\s+/;
const BULLET = /^\s*[-*]\s+/;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const last = blocks.at(-1);
    // Fenced code blocks: everything between ``` lines is shown as-is.
    if (/^\s*```/.test(line)) {
      if (last?.kind === "code" && last.open) last.open = false;
      else blocks.push({ kind: "code", lines: [], open: true });
      continue;
    }
    if (last?.kind === "code" && last.open) {
      last.lines.push(raw);
      continue;
    }
    if (!line.trim()) {
      blocks.push({ kind: "p", lines: [] });
      continue;
    }
    if (NUMBERED.test(line)) {
      const item = { text: line.replace(NUMBERED, ""), subs: [] as string[] };
      if (last?.kind === "ol") last.items.push(item);
      else blocks.push({ kind: "ol", items: [item] });
    } else if (BULLET.test(line)) {
      const text = line.replace(BULLET, "");
      // Bullets right after a numbered item belong to it.
      if (last?.kind === "ol") last.items.at(-1)!.subs.push(text);
      else if (last?.kind === "ul") last.items.push(text);
      else blocks.push({ kind: "ul", items: [text] });
    } else {
      const clean = line.replace(/^#+\s*/, "");
      if (last?.kind === "p") last.lines.push(clean);
      else blocks.push({ kind: "p", lines: [clean] });
    }
  }
  return blocks.filter((b) => (b.kind === "p" ? b.lines.length > 0 : true));
}

export function AnswerText({ text, internalHrefs }: { text: string; internalHrefs?: ReadonlySet<string> }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {parse(text).map((b, bi) => {
        if (b.kind === "ol") {
          return (
            <ol key={bi} className="list-decimal space-y-1.5 pl-5">
              {b.items.map((it, ii) => (
                <li key={ii}>
                  {inline(it.text, `${bi}-${ii}`, internalHrefs)}
                  {it.subs.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {it.subs.map((s, si) => (
                        <li key={si}>{inline(s, `${bi}-${ii}-${si}`, internalHrefs)}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          );
        }
        if (b.kind === "code") {
          return (
            <pre
              key={bi}
              className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed"
            >
              {b.lines.join("\n")}
            </pre>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5">
              {b.items.map((it, ii) => (
                <li key={ii}>{inline(it, `${bi}-${ii}`, internalHrefs)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {b.lines.map((l, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}`, internalHrefs)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
