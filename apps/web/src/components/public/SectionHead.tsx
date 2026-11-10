export function SectionHead({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside?: string;
}) {
  return (
    <div className="section-head">
      <div className="section-head__left">
        <span className="section-head__index">{index}</span>
        <h2 className="section-head__title">{title}</h2>
      </div>
      {aside ? <span className="section-head__aside">{aside}</span> : null}
    </div>
  );
}
