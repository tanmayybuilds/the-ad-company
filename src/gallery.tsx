import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Gallery } from '@/components/site/Gallery';
import { ScrollTrigger } from '@/lib/motion';
import './styles.css';

window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
createRoot(document.getElementById('root')!).render(<StrictMode><Gallery initialBrand={new URLSearchParams(window.location.search).get('brand') || 'all'} /></StrictMode>);
