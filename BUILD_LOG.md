# Build log

A few lines per session. This feeds pages 5 and 6 of the PDF.

## Template

**Date and time spent:**
**What I asked Claude Code to do:**
**What worked on the first try:**
**What broke and how we fixed it:**
**Anything that surprised me about Claude:**
**Screenshot to capture for the PDF:**

---

## Session 1: setup and Phase 1 (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Read the spec, set up the project, and build Phase 1 (skeleton, design system, seeded database).
**What worked on the first try:**
**What broke and how we fixed it:**
- Node.js wasn't installed, and the admin installer needed a password. Claude Code installed the official Node.js LTS into my home folder after checking its checksum. No admin password needed.
- The project starter asked for a Next.js version that wasn't published yet. Claude Code pinned the latest published version.
**Anything that surprised me about Claude:**
- It found two places where my spec contradicted itself (Bluestone's spend math and Copperleaf's question count) and proposed fixes before writing code.
**Screenshot to capture for the PDF:** Book of business with Bluestone marked At risk.

## Session 2: Phase 2, rep home and account tabs (2026-10-15)

**Date and time spent:**
**What I asked Claude Code to do:** Plan and build the book of business with the at-risk panel, and the account detail tabs (overview, plan, adoption, spend, health, questions, tools) with charts.
**What worked on the first try:**
**What broke and how we fixed it:**
- The app's teal looked too gray for chart marks, according to Claude's color checker. Charts now use a brighter teal with amber, which passed the colorblind and contrast checks.
- Premium request spend is under a tenth of seat spend, so its 18% drop disappeared in a stacked chart. Claude split it into its own chart so the drop is obvious.
**Anything that surprised me about Claude:**
**Screenshot to capture for the PDF:** Book of business with the Needs attention panel; Bluestone's Adoption tab (peak 84%, claims team down 41 points); Bluestone's Spend tab.
