"use client";

// Last resort if the root layout itself fails. It replaces the whole document, so it
// carries its own minimal styles.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff", color: "#13201c", margin: 0 }}>
        <main style={{ maxWidth: 420, margin: "15vh auto", padding: "0 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 22 }}>Something went sideways</h1>
          <p style={{ color: "#56635e" }}>Okay, now what? Give it another try in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ background: "#0f766e", color: "#fff", border: 0, borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
