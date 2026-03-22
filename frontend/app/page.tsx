import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Learn with structured subjects and YouTube lessons
      </h1>
      <p className="mt-6 text-lg text-slate-300">
        Sequential lessons unlock as you complete them. Your place in each video is saved automatically, and you can pick
        up where you left off on any device after signing in.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/subjects"
          className="rounded-xl bg-accent px-6 py-3 font-medium text-surface transition-colors hover:bg-accent-dim"
        >
          Browse subjects
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-surface-muted px-6 py-3 font-medium text-slate-200 transition-colors hover:bg-surface-muted"
        >
          Create free account
        </Link>
      </div>
    </div>
  );
}
