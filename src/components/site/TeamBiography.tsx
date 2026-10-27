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

  return <dialog ref={dialog} className="project-dialog team-bio" aria-labelledby={node ? 'team-bio-title' : undefined}
    onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    {node && <>
      <button type="button" className="dialog-close" autoFocus onClick={() => dialog.current?.close()}>{team.closeBio} ×</button>
      <div className="team-bio-content">
        <p className="team-bio-role">{node.roleTitle}</p>
        <h2 id="team-bio-title">{node.memberName}</h2>
        <p className="team-bio-headline">{node.responsibility}</p>
        {node.introCopy.startsWith('“') && <blockquote>{node.introCopy}</blockquote>}
        {node.biography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </>}
  </dialog>;
}
