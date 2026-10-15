import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <Wordmark className="mb-6" />
      <h1 className="text-title font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-ink-muted">Okay, now what? Head back and try again.</p>
      <Link href="/" className="mt-6 font-medium text-accent hover:text-accent-hover">
        Go to the home page
      </Link>
    </main>
  );
}
