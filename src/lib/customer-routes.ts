// The customer portal's pages, in one place: the tab nav and the leak checker both read this list.

export const CUSTOMER_NAV = [
  { href: "", label: "Home" },
  { href: "/plan", label: "Plan" },
  { href: "/learn", label: "Learn" },
  { href: "/guides", label: "Guides" },
  { href: "/videos", label: "Videos" },
  { href: "/setup", label: "Setup guide" },
  { href: "/kit", label: "Champion kit" },
  { href: "/progress", label: "Progress" },
  { href: "/value", label: "Value" },
  { href: "/review", label: "Business review" },
] as const;

/** Tabs that only appear once there's something to show. */
export const CONDITIONAL_TABS = { review: "/review" } as const;

/** Every page under /c/[token], including ones not in the nav (Ask also floats on every page). */
export const CUSTOMER_PAGES: string[] = [...CUSTOMER_NAV.map((t) => t.href), "/ask"];
