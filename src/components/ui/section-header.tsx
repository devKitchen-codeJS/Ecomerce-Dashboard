type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div>
      {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{description}</p> : null}
    </div>
  );
}
