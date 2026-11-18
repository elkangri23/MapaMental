import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import spanish from '../../../../docs/guia/es.md?raw';
import french from '../../../../docs/guia/fr.md?raw';
import english from '../../../../docs/guia/en.md?raw';

const guides = {
  es: { text: spanish, title: 'Ayuda · empieza aquí', language: 'Idioma de la ayuda', contents: 'Secciones de ayuda', close: 'Cerrar ayuda' },
  fr: { text: french, title: 'Aide · premiers pas', language: 'Langue du guide', contents: 'Sommaire du guide', close: 'Fermer l’aide' },
  en: { text: english, title: 'Help · getting started', language: 'Guide language', contents: 'Guide contents', close: 'Close help' },
};
type Language = keyof typeof guides;

function isLanguage(value: string | null): value is Language {
  return value === 'es' || value === 'fr' || value === 'en';
}

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem('espacio-visual.help.language');
    if (isLanguage(saved)) return saved;
  } catch { /* El navegador puede bloquear el almacenamiento local. */ }
  return 'es';
}

// Los títulos de nivel dos son secciones. Los de nivel tres abren preguntas del manual.
function readHeading(text: string) {
  const [title, ...lines] = text.trim().split('\n');
  return { title: title.trim(), body: lines.join('\n').trim() };
}

function sectionsOf(text: string) {
  return text.replaceAll('\r\n', '\n').split(/^## /m).slice(1).map(section => {
    const { title, body } = readHeading(section);
    const [introduction, ...questions] = body.split(/^### /m);
    return { title, introduction, questions: questions.map(readHeading) };
  });
}

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [language, setLanguage] = useState(initialLanguage);
  const guide = guides[language];
  const sections = sectionsOf(guide.text);

  useEffect(() => {
    dialogRef.current?.showModal();
    closeButtonRef.current?.focus();
  }, []);

  function changeLanguage(value: string) {
    if (!isLanguage(value)) return;
    setLanguage(value);
    try { localStorage.setItem('espacio-visual.help.language', value); }
    catch { /* La selección sigue activa en esta ventana. */ }
  }

  return <dialog ref={dialogRef} lang={language} className="recovery-dialog help-dialog" aria-labelledby="help-title" onClose={onClose}>
    <header className="recovery-dialog__head">
      <strong id="help-title">{guide.title}</strong>
      <button ref={closeButtonRef} type="button" className="round-button" aria-label={guide.close} onClick={() => dialogRef.current?.close()}>×</button>
    </header>
    <label className="help-language">{guide.language}
      <select value={language} onChange={event => changeLanguage(event.target.value)}>
        <option value="es" lang="es">Español</option>
        <option value="fr" lang="fr">Français</option>
        <option value="en" lang="en">English</option>
      </select>
    </label>
    <nav className="help-nav" aria-label={guide.contents}>
      {sections.map(({ title }, index) => <a key={title} href={`#help-section-${index}`}>{title}</a>)}
    </nav>
    <div className="help-content" key={language}>
      {sections.map(({ title, introduction, questions }, index) =>
        <section key={title} id={`help-section-${index}`} aria-labelledby={`help-heading-${index}`}>
          <h2 id={`help-heading-${index}`}>{title}</h2>
          <Markdown>{introduction}</Markdown>
          {questions.map(question => <details key={question.title}>
            <summary>{question.title}</summary>
            <Markdown>{question.body}</Markdown>
          </details>)}
        </section>
      )}
    </div>
  </dialog>;
}
