import { useState } from 'react';
import { team } from '@/content/site';
import { useMobileLayout } from '@/hooks/use-mobile-layout';
import { TeamTour } from './TeamTour';
import { TeamBiography } from './TeamBiography';
import { ActionLink, Eyebrow } from './primitives';

function MobileTeam() {
  const [profile, setProfile] = useState<number | null>(null);
  return <section id="team" className="team-list section-y" aria-labelledby="team-title">
    <div className="container-page">
      <header className="team-list-heading">
        <Eyebrow>{team.eyebrow}</Eyebrow>
        <h2 id="team-title" className="text-display-md">{team.heading.join(' ')}</h2>
      </header>
      <div className="team-member-list">
        {team.members.map((member, index) => <article key={member.id} className="team-member-row" aria-labelledby={`${member.id}-name`}>
          <div className="team-member-photo"><img src={`${import.meta.env.BASE_URL}${member.cutoutUrl.slice(1)}`} alt={member.memberName} width="190" height="260" loading="lazy" decoding="async" /></div>
          <div className="team-member-copy">
            <h3 id={`${member.id}-name`}>{member.memberName}</h3>
            <p className="team-member-role">{member.roleTitle}</p>
            <p>{member.responsibility}</p>
            <p className="team-member-intro">{member.introCopy}</p>
            <button type="button" className="team-member-bio" aria-haspopup="dialog" aria-label={`${team.readBio}: ${member.memberName}`} onClick={() => setProfile(index)}>{team.readBio}<span aria-hidden="true">↗</span></button>
          </div>
        </article>)}
      </div>
      <ActionLink href="#contact" variant="outline" size="md" className="team-list-continue">{team.skip}<span aria-hidden="true">↘</span></ActionLink>
    </div>
    <TeamBiography node={profile === null ? null : team.members[profile]} onClose={() => setProfile(null)} />
  </section>;
}

export function Team() {
  return useMobileLayout() ? <MobileTeam /> : <TeamTour />;
}
