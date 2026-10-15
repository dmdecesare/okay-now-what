import type { QuestionTopic } from "@/lib/schemas";

// Keyword fallback for tagging a question when live AI is unavailable, so the
// security-questions risk rule still works.

const RULES: [QuestionTopic, RegExp][] = [
  ["security", /secur|privacy|private|data|train|exclu|leak|ip\b|indemn|public code|retention|where (does )?(our )?code go/i],
  ["compliance", /audit|complian|regulat|soc ?2|gdpr|hipaa|pci|cfpb|certif|govern/i],
  ["setup", /install|set ?up|configur|enable|seat|license|policy|polic|admin|instructions|sso|proxy|firewall/i],
  ["usage", /how (do|can|should)|tip|prompt|test|refactor|review|agent|chat|suggest|adopt|use /i],
];

export function guessTopic(question: string): QuestionTopic {
  return RULES.find(([, re]) => re.test(question))?.[0] ?? "other";
}
