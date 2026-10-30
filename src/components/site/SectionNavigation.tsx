import { useEffect } from 'react';
import { installSectionNavigation, settleScrollTweens } from '@/lib/section-navigation.mjs';
import { ScrollTrigger } from '@/lib/motion';

export function SectionNavigation() {
  useEffect(() => installSectionNavigation(() => {
    ScrollTrigger.update();
    settleScrollTweens(ScrollTrigger.getAll());
    ScrollTrigger.refresh();
  }), []);
  return null;
}
