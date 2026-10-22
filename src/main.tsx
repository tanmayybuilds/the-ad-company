import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { ClientStrip } from '@/components/site/ClientStrip';
import { Services } from '@/components/site/Services';
import { Work, About, Team, Footer } from '@/components/site/Sections';
import { CoverflowCoverage } from '@/components/site/CoverflowCoverage';
import { Contact } from '@/components/site/Contact';
import { ScrollTrigger } from '@/lib/motion';
import './styles.css';

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
}

export function App() {
  return <><Header /><main id="main" tabIndex={-1}><Hero /><ClientStrip /><Services /><Work /><About /><CoverflowCoverage /><Team /><Contact /></main><Footer /></>;
}
if (typeof document !== 'undefined') {
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
}

