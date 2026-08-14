interface Props {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
}

export function UnderstoodItem({ title, subtitle, onEdit }: Props) {
  return (
    <div className="w-full bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-2xl flex items-center justify-between transition-all">
      <div>
        <h4 className="text-sm font-bold text-brand-text">{title}</h4>
        {subtitle && <p className="text-xs text-brand-subtle mt-0.5">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#7A7062] hover:text-brand-text flex items-center justify-center"
      >
        <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}