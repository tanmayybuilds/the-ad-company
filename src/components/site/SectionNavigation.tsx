import { useEffect } from 'react';
import { installSectionNavigation } from '@/lib/section-navigation.mjs';
import { ScrollTrigger } from '@/lib/motion';

export function SectionNavigation() {
  useEffect(() => installSectionNavigation(() => {
    ScrollTrigger.update();
    for (const trigger of ScrollTrigger.getAll()) trigger.getTween()?.progress(1);
    ScrollTrigger.refresh();
  }), []);
  return null;
}
