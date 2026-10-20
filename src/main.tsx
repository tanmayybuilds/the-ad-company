import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { ClientStrip } from '@/components/site/ClientStrip';
import { Services } from '@/components/site/Services';
import { Work, About, Coverage, Team, Footer } from '@/components/site/Sections';
import { Contact } from '@/components/site/Contact';
import './styles.css';

function App() {
  return <><Header /><main id="main" tabIndex={-1}><Hero /><ClientStrip /><Services /><Work /><About /><Coverage /><Team /><Contact /></main><Footer /></>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
