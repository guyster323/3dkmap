export function WoodPanel({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={`wood-panel ${className}`}>
      {title && (
        <header className="flex items-center gap-2 border-b-2 border-gold-dim bg-[#3a2416] px-3 py-1.5">
          <span className="inline-block h-4 w-4 rounded-sm bg-cinnabar text-center font-serif text-[10px] leading-4 text-paper">
            印
          </span>
          <h2 className="seal text-sm text-gold">{title}</h2>
        </header>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}

export function PortraitFrame({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <figure className="w-fit">
      <div className="wood-panel p-1">
        <div className="wood-inlay pixelated overflow-hidden">{children}</div>
      </div>
      {caption && (
        <figcaption className="mt-1 text-center font-serif text-xs text-gold">{caption}</figcaption>
      )}
    </figure>
  );
}
