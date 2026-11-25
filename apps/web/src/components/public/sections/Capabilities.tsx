import { CAPABILITIES } from '@/lib/public-content';
import { SectionHead } from '@/components/public/SectionHead';

export function Capabilities() {
  return (
    <section className="section container-ed" id="capabilities">
      <SectionHead index="02" title="What I work on" aside="Three disciplines" />

      <div className="cap-grid">
        {CAPABILITIES.map((capability) => (
          <article key={capability.index} className="cap">
            <span className="cap__index">{capability.index}</span>
            <h3 className="cap__title">{capability.title}</h3>
            <p className="cap__body">{capability.body}</p>
            <ul className="cap__list">
              {capability.detail.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
