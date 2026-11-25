import { PRINCIPLES } from '@/lib/public-content';
import { SectionHead } from '@/components/public/SectionHead';

export function Principles() {
  return (
    <section className="section container-ed" id="principles">
      <SectionHead index="03" title="How I work" aside="Four rules" />

      <ol className="principle-list">
        {PRINCIPLES.map((principle) => (
          <li key={principle.index} className="principle">
            <span className="principle__index">{principle.index}</span>
            <h3 className="principle__title">{principle.title}</h3>
            <p className="principle__body">{principle.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
