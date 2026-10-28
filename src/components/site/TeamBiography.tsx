import { useEffect, useRef } from 'react';
import { team, type TeamPointerNode } from '@/content/site';

export function TeamBiography({ node, onClose }: { node: TeamPointerNode | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = dialog.current!;
    modal.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      modal.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [node]);

  return <dialog ref={dialog} className={`team-bio team-node-${node?.theme || 'stone'}`} aria-labelledby={node ? 'team-bio-title' : undefined}
    onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    {node && <>
      <header className="team-bio-bar"><span>{node.number}</span><strong>{node.stageTitle}</strong><button type="button" autoFocus onClick={() => dialog.current?.close()}>{team.closeBio} ×</button></header>
      <div className="team-bio-layout">
      <div className="team-bio-stage" aria-hidden="true">
        <span className="team-bio-spark">✦</span>
        <img src={node.cutoutUrl.startsWith('/') ? `${import.meta.env.BASE_URL}${node.cutoutUrl.slice(1)}` : node.cutoutUrl} alt="" width="260" height="350" decoding="async" />
        <span className="team-bio-pointer">{node.number}</span>
      </div>
      <div className="team-bio-content">
        <p className="team-bio-role">{node.roleTitle}</p>
        <h2 id="team-bio-title">{node.memberName}</h2>
        <p className="team-bio-headline">{node.responsibility}</p>
        {node.introCopy.startsWith('“') && <blockquote>{node.introCopy}</blockquote>}
        {node.biography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
      </div>
    </>}
  </dialog>;
}
