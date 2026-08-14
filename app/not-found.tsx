import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center min-h-dvh">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-[#EBE5DA] text-[#8C7A6B] flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-extrabold text-brand-text">404</h1>
      <p className="text-sm text-brand-subtle mt-2 max-w-[260px]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 min-h-[48px] px-8 py-3 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-sm shadow-sm active:scale-[0.98] transition-all inline-flex items-center justify-center"
      >
        Go Home
      </Link>
    </main>
  );
}
