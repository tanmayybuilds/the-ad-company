import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import campaigns from "@/content/campaigns.json";
import { gallery } from "@/content/site";
import { galleryItems } from "@/lib/gallery.mjs";
import { gsap, MQ, useGSAP } from "@/lib/motion";
import { Header } from "./Header";
import { SectionNavigation } from "./SectionNavigation";
import { Footer } from "./Sections";
import { ActionLink } from "./primitives";
import './gallery.css';

const base = import.meta.env.BASE_URL;
const asset = (source: string) => `${base}${source.slice(1)}`;

export function Gallery({ initialBrand = 'all' }: { initialBrand?: string } = {}) {
  const root = useRef<HTMLDivElement>(null);
  const fan = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState(campaigns.brands.some(brand => brand.id === initialBrand) ? initialBrand : 'all');
  const [selected, setSelected] = useState<number | null>(null);
  const photos = galleryItems(campaigns.brands, filter);
  const photo = selected === null ? null : photos[selected];
  const isOpen = selected !== null;
  const heroPhotos = campaigns.brands.filter(brand => ['malabar', 'maruti-suzuki', 'truemeds', 'tdf', 'milkbasket', 'vihan', 'jgp', 'wockhardt', 'nova', 'decathlon'].includes(brand.id));
  const move = (direction: number) => setSelected(value => ((value ?? 0) + direction + photos.length) % photos.length);
  const selectBrand = (id: string) => {
    setSelected(null);
    setFilter(id);
    const url = new URL(window.location.href);
    if (id === 'all') url.searchParams.delete('brand'); else url.searchParams.set('brand', id);
    window.history.replaceState(null, '', url);
  };

  useEffect(() => {
    if (!isOpen) return;
    const modal = dialog.current!, previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    return () => { if (modal.open) modal.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, [isOpen]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(MQ.motion, () => {
      gsap.from('.gallery-hero-arrival', { x: 180, y: 180, rotation: -8, autoAlpha: 0, duration: 1.15, stagger: .075, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
      gsap.to(fan.current, { y: -55, rotation: -2, ease: 'none', scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: .7 } });
    });
    return () => media.revert();
  }, { scope: root });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add(MQ.motion, () => {
      gsap.from('.gallery-print', { y: 28, rotation: (index: number) => index % 2 ? 3 : -3, autoAlpha: 0, stagger: .025, duration: .55, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
    });
    return () => media.revert();
  }, { scope: wall, dependencies: [filter], revertOnUpdate: true });

  return <div ref={root} className="campaign-gallery">
    <SectionNavigation />
    <Header homePath={base} />
    <main id="main" tabIndex={-1}>
      <section id="top" className="gallery-hero" aria-labelledby="gallery-title">
        <div className="gallery-hero-copy">
          <p className="gallery-page-name">{gallery.name}</p>
          <h1 id="gallery-title">{gallery.title[0]}<br />{gallery.title[1]}</h1>
          <p className="gallery-intro">{gallery.intro}</p>
          <a className="gallery-explore" href="#campaign-wall">{gallery.explore}<span aria-hidden="true">↓</span></a>
        </div>
        <div className="gallery-hero-art">
          <div ref={fan} className="gallery-hero-fan">
            {heroPhotos.map((brand, index) => <a key={brand.id} href="#campaign-wall" onClick={() => selectBrand(brand.id)} aria-label={`${gallery.viewBrand}: ${brand.name}`} className="gallery-hero-card" style={{ '--print-index': index % 5, '--print-row': Math.floor(index / 5) } as CSSProperties}>
              <div className="gallery-hero-arrival"><figure className="gallery-hero-print">
                <img src={asset(brand.photos[0].thumbnail)} alt="" width={brand.photos[0].width} height={brand.photos[0].height} decoding="async" />
                <figcaption>{brand.label}</figcaption>
              </figure></div>
            </a>)}
          </div>
          <p className="gallery-handwritten">{gallery.note}</p>
        </div>
      </section>

      <section id="campaign-wall" className="gallery-collection" aria-labelledby="gallery-wall-title">
        <div className="gallery-collection-heading"><h2 id="gallery-wall-title">{gallery.wallTitle}</h2><p aria-live="polite">{photos.length} {gallery.photoCount}</p></div>
        <div className="gallery-filter-bar" role="group" aria-label={gallery.filterLabel}>
          <button type="button" aria-pressed={filter === 'all'} onClick={() => selectBrand('all')}>{gallery.all}</button>
          {campaigns.brands.map(brand => <button type="button" key={brand.id} aria-pressed={filter === brand.id} onClick={() => selectBrand(brand.id)}>{brand.label}<span>{brand.photos.length}</span></button>)}
        </div>
        <p className="gallery-photo-hint">{gallery.photoHint}</p>
        <div ref={wall} className="gallery-wall">
          {photos.map((item, index) => <figure key={item.id} className="gallery-print" style={{ '--print-angle': `${[-1.3, .8, -.5, 1.2, -.8][index % 5]}deg` } as CSSProperties}>
            <button type="button" className="gallery-photo-button" aria-label={`${gallery.openPhoto}: ${item.alt}`} aria-haspopup="dialog" aria-controls="gallery-viewer" onClick={() => setSelected(index)}>
              <img src={asset(item.thumbnail)} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
              <span className="gallery-photo-open" aria-hidden="true">↗</span>
            </button>
            <figcaption><span>{item.brandName}</span><span aria-hidden="true">↗</span></figcaption>
          </figure>)}
        </div>
      </section>

      <section className="gallery-end"><h2>{gallery.endTitle}</h2><ActionLink href={`${base}#contact`} variant="signal">{gallery.endCta}</ActionLink></section>

      <dialog ref={dialog} id="gallery-viewer" className="gallery-viewer" aria-labelledby={photo ? 'gallery-photo-caption' : undefined}
        onCancel={() => setSelected(null)} onClose={() => setSelected(null)}
        onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
        }}>
        {photo && <div className="gallery-viewer-inner">
          <button className="gallery-viewer-close" type="button" onClick={() => setSelected(null)} aria-label={gallery.closePhoto} autoFocus>×</button>
          <img key={photo.id} src={asset(photo.src)} alt={photo.alt} width={photo.width} height={photo.height} />
          <div className="gallery-viewer-caption"><h2 id="gallery-photo-caption">{photo.brandName}</h2><p role="status">{(selected ?? 0) + 1} / {photos.length}</p></div>
          <div className="gallery-viewer-controls"><button type="button" disabled={photos.length < 2} aria-label={gallery.previousPhoto} onClick={() => move(-1)}>←</button><span>{photo.alt}</span><button type="button" disabled={photos.length < 2} aria-label={gallery.nextPhoto} onClick={() => move(1)}>→</button></div>
        </div>}
      </dialog>
    </main>
    <Footer homePath={base} />
  </div>;
}
