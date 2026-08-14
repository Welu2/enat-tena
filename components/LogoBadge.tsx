export function LogoBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div
      className={`${dimension} bg-brand-green rounded-2xl flex items-center justify-center shadow-md transition-transform active:scale-95`}
    >
      <svg
        className={`${iconSize} text-white fill-current`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    </div>
  );
}