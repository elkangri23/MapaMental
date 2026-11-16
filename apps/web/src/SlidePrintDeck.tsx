import { useEffect, useRef } from 'react';
import type { PresentationSlide } from '@espacio-visual/domain';
import { SlideTableBlock } from './SlideTableBlock.js';

function fitPages(deck: HTMLElement) {
  const pages = [...deck.querySelectorAll<HTMLElement>('.slide-print-area')].map((area) => ({
    area,
    content: area.querySelector<HTMLElement>('.slide-print-content')!,
    low: 0,
    high: 1,
  }));
  for (const page of pages) page.content.style.removeProperty('--slide-print-zoom');
  const fits = ({ area, content }: typeof pages[number]) =>
    content.getBoundingClientRect().height <= area.getBoundingClientRect().height - 2;
  const densePages = pages.filter((page) => !fits(page));
  // Batch layout writes and reads so a long deck is measured together.
  for (let pass = 0; pass < 9 && densePages.length; pass++) {
    const guesses = densePages.map(({ low, high }) => (low + high) / 2);
    densePages.forEach(({ content }, index) => content.style.setProperty('--slide-print-zoom', String(guesses[index])));
    densePages.forEach((page, index) => {
      if (fits(page)) page.low = guesses[index];
      else page.high = guesses[index];
    });
  }
  for (const { content, low } of densePages) content.style.setProperty('--slide-print-zoom', String(low || 1 / 1024));
}

export function SlidePrintDeck({ slides }: { slides: PresentationSlide[] }) {
  const deckRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const beforePrint = () => { if (deckRef.current) fitPages(deckRef.current); };
    window.addEventListener('beforeprint', beforePrint);
    return () => window.removeEventListener('beforeprint', beforePrint);
  }, []);

  return (
    <div ref={deckRef} className="slide-print-deck">
      {slides.map((slide, index) => {
        const steps = slide.diagramSteps?.filter((step) => step.trim()) ?? [];
        const fields = slide.mockFields ?? [];
        const hasVisuals = !!slide.table || steps.length > 0 || fields.length > 0;
        const useColumns = hasVisuals && (slide.body.length > 300 || slide.bullets.length >= 4);
        return (
          <article className="slide-print-page" key={slide.id} aria-labelledby={`slide-print-title-${slide.id}`}>
            <div className="slide-print-area">
              <div className="slide-print-content">
                <span className="slide-print-page__eyebrow">{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
                <h1 id={`slide-print-title-${slide.id}`}>{slide.title || 'Sin título'}</h1>
                {slide.subtitle && <p className="slide-print-page__subtitle">{slide.subtitle}</p>}
                <div className={useColumns ? 'slide-print-columns' : undefined}>
                  <div>
                    {slide.body && <p className="slide-print-page__body">{slide.body}</p>}
                    {slide.bullets.some((bullet) => bullet.trim()) && <ul>{slide.bullets.filter((bullet) => bullet.trim()).map((bullet, item) => <li key={item}>{bullet}</li>)}</ul>}
                  </div>
                  {hasVisuals && <div>
                    {slide.table && <SlideTableBlock table={slide.table} />}
                    {!!steps.length && <ol className="slide-print-flow" aria-label="Pasos del recorrido">{steps.map((step, item) => <li className="slide-flow-preview__item" key={item}>{step}</li>)}</ol>}
                    {!!fields.length && <dl className="slide-print-form" aria-label="Campos del formulario ficticio">{fields.map((field, item) => <div className="slide-mock-form__sample" key={item}><dt>{field.label}</dt><dd>{field.value || 'Valor de ejemplo'}</dd></div>)}</dl>}
                  </div>}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
