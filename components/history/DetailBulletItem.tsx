interface DetailBulletItemProps {
  title: string;
  subtitle?: string;
}

export function DetailBulletItem({ title, subtitle }: DetailBulletItemProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
      <div>
        <h4 className="text-sm font-bold text-brand-text leading-snug">{title}</h4>
        {subtitle && (
          <p className="text-xs text-brand-subtle font-normal mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}