export function installSectionNavigation(settle: () => void): () => void;
export function isSectionNavigating(): boolean;
export function settleScrollTweens(triggers: Iterable<{ getTween(): unknown }>): void;
