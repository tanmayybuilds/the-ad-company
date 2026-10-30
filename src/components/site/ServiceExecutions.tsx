import { useState } from 'react';
import { serviceShowcase } from '@/content/site';
import { useMobileLayout } from '@/hooks/use-mobile-layout';
import { CoverflowCoverage } from './CoverflowCoverage';
import { Eyebrow } from './primitives';

function MobileExecutions() {
  const [failed, setFailed] = useState<string[]>([]);
  const items = serviceShowcase.items.filter(item => item.execution?.src && !failed.includes(item.id));
  if (!items.length) return null;
  return <section id="coverage" className="mobile-executions section-y" aria-labelledby="coverage-title">
    <div className="container-page">
      <Eyebrow>{serviceShowcase.label}</Eyebrow>
      <h2 id="coverage-title" className="text-display-md">{serviceShowcase.heading}</h2>
      <div className="mobile-execution-list">{items.map(item => {
        const image = item.execution!;
        return <figure key={item.id}>
          <img src={`${import.meta.env.BASE_URL}${image.src.slice(1)}`} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" onError={() => setFailed(previous => [...previous, item.id])} />
          <figcaption><h3>{item.title}</h3>{image.description && <p>{image.description}</p>}</figcaption>
        </figure>;
      })}</div>
    </div>
  </section>;
}

export function ServiceExecutions() {
  return useMobileLayout() ? <MobileExecutions /> : <CoverflowCoverage />;
}
