import { useState } from 'react';
import { applyCitation, citeText } from './kit/citation';
import type { CitePage } from './kit/citation';
import { copyText } from './kit/copy';

export const siteCitation: CitePage = {"title": "KeyMaster", "site": "KeyMaster", "url": "https://keymaster.edutools.fyi/", "description": "Learn and practise keyboard shortcuts organised around everyday computer tasks.", "authors": ["Dominik Lukeš"], "type": "webpage"};

export function setPageCitation(page: CitePage): void {
  applyCitation(page);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = page.url;
}

export function CiteThisPage({ page = siteCitation }: { page?: CitePage }) {
  const [status, setStatus] = useState('');
  const text = citeText(page);
  return <section className="mt-6 text-sm leading-relaxed" aria-label="Cite this page">
    <h2 className="font-semibold">Cite this page</h2>
    <p>{text}</p>
    <button type="button" className="underline" onClick={async () =>
      setStatus(await copyText(text) ? 'Citation copied.' : 'Copy failed. Select the citation and copy it by hand.')
    }>Copy citation</button>
    <p role="status">{status}</p>
  </section>;
}
