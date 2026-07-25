export function InternalHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="internal-hero">
      <div className="internal-hero-copy">
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="internal-hero-signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
