/**
 * Editable company content for THE AD COMPANY website.
 *
 * Everything marked `provisional` or `null` is awaiting confirmation from the
 * business. Replace placeholders here — components read only from this file.
 */

export type NavItem = { label: string; href: `#${string}` };

export type Service = {
  id: string;
  index: string;
  title: string;
  lead: string;
  formats: string[];
  /** Residential & community is the company's strongest emphasis. */
  primary?: boolean;
  visualLabel: string;
  badge: string;
  focusLabel: string;
};

export type Project = {
  id: string;
  title?: string;
  deliverables?: string[];
  video?: { src: string; poster?: string; alt: string };
  featured?: boolean;
  client: string | null;
  service: string | null;
  location: string | null;
  description: string | null;
  /** Real campaign photographs only. Leave empty until a project pack is supplied. */
  photos: { src: string; alt: string }[];
  /** Verified results only — never estimates. */
  results: string[] | null;
  /** Extra execution notes revealed by an on-page disclosure when present. */
  details: string[] | null;
};

export type Location = { name: string; kind: "City" | "State / region"; state?: string };

export const company = {
  name: "The Ad Company",
  wordmark: "THE AD COMPANY",
  tagline: "Committed to commitments.",
  concept: "The world is our canvas.",
  description: "End-to-end advertising across ATL, BTL, OOH, digital and branded content platforms.",
  contact: {
    email: "ad@theadcompany.com",
    phone: "+91 77150 01514",
    address: null as string | null,
    /** International format without "+" or spaces. */
    whatsapp: "917715001514",
  },
  social: {
    instagram: null as string | null,
    linkedin: null as string | null,
  },
};

export const nav: NavItem[] = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Coverage", href: "#coverage" },
  { label: "Team", href: "#team" },
];

export type HeroPanel = { id: string; channel: string; title: string[]; caption: string; image: string | null };

export const hero = {
  eyebrow: "ATL. BTL. OOH. Digital. Branded content.",
  headline: ["Your brand.", "Where it matters."],
  copy: "From neighbourhood activations to nationwide media campaigns, we bring strategy, creativity and execution together.",
  locationLabel: "Across India. On the ground.",
  scrollLabel: "Explore our services",
  placementNote: "Illustrative placements. A little room for your next big idea.",
  placeholderLabel: "Artwork placeholder",
  panelAction: "Explore",
  artwork: {
    community: ["Your", "brand", "here."],
    digital: ["Right", "here."],
    ticketLabel: "Admit one good idea",
    ticket: ["Big", "screen.", "Big", "energy."],
    record: ["Stay in", "the conversation."],
    routeStart: "The brief.",
    routeEnd: ["The right", "direction."],
  },
  panels: [
    { id: "community", channel: "BTL / Community", title: ["Close to", "your people."], caption: "Societies. Activations. Everyday connections.", image: null },
    { id: "outdoor", channel: "OOH / Transit", title: ["Out there.", "On their way."], caption: "Streets, stations and moving journeys.", image: "/brand/billboard.jpg" },
    { id: "digital", channel: "Digital / Screens", title: ["Right place.", "Bright ideas."], caption: "Your brand, in the frame.", image: null },
    { id: "atl", channel: "ATL / Mass media", title: ["Think big.", "Show up."], caption: "Broadcast. Print. Cinema.", image: null },
    { id: "content", channel: "Branded content", title: ["Part of the", "conversation."], caption: "Stories worth being part of.", image: null },
    { id: "planning", channel: "Media planning", title: ["A plan", "behind it all."], caption: "The audience. The medium. The moment.", image: null },
  ] satisfies HeroPanel[],
  primaryCta: { label: "Explore our work", href: "#work" },
  secondaryCta: { label: "Let’s talk", href: "#contact" },
  artNotes: { top: "↳ Built for everyday places.", bottom: "Made to get noticed." },
};

export const clients = {
  heading: "Our Clientele",
  interactionHint: "Flip a card. Explore the work.",
  viewMore: "View more",
  closePreview: "Close brand preview",
  pending: "Campaign showcase coming soon",
  pause: "Pause brand animation",
  resume: "Resume brand animation",
  preview: "Preview",
  items: [
    { name: "Malabar Gold and Diamonds", logo: "/clients/malabar-gold-diamonds.svg", width: 255, height: 52, background: "#20201E" },
    { name: "TDF Diamonds & Gold", logo: "/clients/tdf-diamonds-gold.webp", width: 152, height: 152 },
    { name: "Vihan Modular", logo: "/clients/vihan-modular.png", width: 200, height: 48 },
    { name: "Jagannath Gangaram Pednekar Jewellers", logo: "/clients/jg-pednekar.png", width: 632, height: 395 },
    { name: "Michelin", logo: "/clients/michelin.svg", width: 534, height: 120 },
    { name: "TyresNmore", logo: "/clients/tyresnmore.png", width: 1854, height: 314 },
    { name: "State Bank of India (SBI)", logo: "/clients/sbi.png", width: 125, height: 43 },
    { name: "Wockhardt Hospitals", logo: "/clients/wockhardt-hospitals.webp", width: 276, height: 49 },
    { name: "Toyota India", logo: "/clients/toyota.svg", width: 136, height: 24 },
    { name: "Maruti Suzuki India", logo: "/clients/maruti-suzuki.svg", width: 1398, height: 156 },
    { name: "Milkbasket", logo: "/clients/milkbasket.png", width: 800, height: 300 },
    { name: "Truemeds", logo: "/clients/truemeds.svg", width: 202, height: 48 },
    { name: "Apollo Diagnostics", logo: "/clients/apollo-diagnostics.png", width: 1920, height: 1080 },
    { name: "Suburban Diagnostics", logo: "/clients/suburban-diagnostics.webp", width: 226, height: 63 },
    { name: "Nova IVF Fertility", logo: "/clients/nova-ivf.webp", width: 350, height: 54 },
    { name: "Decathlon Sports India", logo: "/clients/decathlon.svg", width: 188, height: 28 },
  ],
};

/** Includes offerings supplied in the company's October 2026 introduction slides. */
export const services = {
  eyebrow: "[02 // Where your brand can show up]",
  journeyHint: "Interactive 3D environment journey — scroll or click any vertical to explore.",
  loadingLabel: "Loading environment sequence",
  unavailable: "Some animation frames could not load. Showing the available illustration.",
  heading: ["Real places.", "Real brand presence."],
  intro:
    "Mass reach, local engagement and the right media mix. Explore our on-ground environments, then open a card in Out in the world to discover our full range of services.",
  catalogueHeading: "One brief. Every possibility.",
  catalogueIntro: "End-to-end advertising, from the first media plan to the final campaign rollout.",
  catalogue: [
    {
      id: "atl",
      title: "ATL media",
      lead: "Mass reach advertising",
      copy: "Build broad awareness through broadcast, print, cinema and prominent outdoor placements.",
      formats: ["Television", "Radio", "Cinema advertising", "Hoardings", "Newspaper advertising & inserts"],
    },
    {
      id: "btl",
      title: "BTL media",
      lead: "Targeted brand engagement",
      copy: "Meet people in their communities, at work and through the deliveries they receive.",
      formats: ["Residential & corporate activations", "Door-to-door & community campaigns", "Sampling distribution", "Swiggy Instamart inserts", "Zepto inserts", "Blinkit inserts"],
    },
    {
      id: "ooh",
      title: "OOH media",
      lead: "High-impact outdoor visibility",
      copy: "Keep your brand in view across streets, transport networks and everyday journeys.",
      formats: ["Bus branding", "Metro advertising", "Train branding", "Auto & cab branding", "Airport media", "Pole kiosks", "Transit media", "Signage branding"],
    },
    {
      id: "branded-content",
      title: "Branded content & integration",
      lead: "Part of the story",
      copy: "Bring your brand into the conversations, films and personalities your audience follows.",
      formats: ["Podcast integration", "In-film branding", "Brand ambassador & celebrity endorsements"],
    },
    {
      id: "media-planning",
      title: "Media planning & buying",
      lead: "A clear strategy for every placement",
      copy: "Match your objectives to the right audiences, locations and media, with cost-effective buying.",
      formats: ["Strategic media planning", "Location & audience mapping", "Cost-effective media buying"],
    },
    {
      id: "digital",
      title: "Digital & indoor media",
      lead: "Visibility across screens",
      copy: "Connect your on-ground presence with digital promotions and screens in everyday spaces.",
      formats: ["Digital branding & promotions", "Outdoor digital advertising", "Residential & indoor digital screens", "In-app advertising"],
    },
  ],
  environmentOptionsLabel: "Advertising environments",
  mediaOptionsLabel: "Media & campaign services",
  items: [
    {
      id: "residential",
      index: "01",
      title: "Residential & community",
      lead: "Bring your brand into everyday neighbourhood life.",
      formats: [
        "Residential society advertising",
        "Residential digital screens",
        "Door-to-door campaigns",
        "Flyer distribution",
        "Community activations",
      ],
      primary: true,
      visualLabel: "Residential society",
      badge: "Primary focus",
      focusLabel: "Our primary focus",
    },
    {
      id: "corporate",
      index: "02",
      title: "Corporate & coworking",
      lead: "Connect with people where their working day happens.",
      formats: ["Corporate office advertising", "Coworking space campaigns", "Workspace activations"],
      visualLabel: "Corporate & coworking",
      badge: "Workspace media",
      focusLabel: "Decision makers",
    },
    {
      id: "outdoor",
      index: "03",
      title: "Outdoor & transit",
      lead: "Build visibility across streets and moving journeys.",
      formats: ["Outdoor digital advertising", "Transit advertising", "Auto branding", "Cab branding"],
      visualLabel: "Outdoor & transit",
      badge: "High visibility",
      focusLabel: "Citywide reach",
    },
    {
      id: "cinema",
      index: "04",
      title: "Cinema, airports & in-flight",
      lead: "Reach audiences across entertainment and travel.",
      formats: ["Cinema advertising", "Airport advertising", "In-flight advertising"],
      visualLabel: "Cinema & airports",
      badge: "Captive audience",
      focusLabel: "Premium dwell time",
    },
    {
      id: "delivery",
      index: "05",
      title: "Delivery & in-app",
      lead: "Show up at the doorstep and on the screen.",
      formats: ["Swiggy Instamart inserts", "Zepto inserts", "Blinkit inserts", "Delivery flyer campaigns", "In-app advertising"],
      visualLabel: "Delivery & in-app",
      badge: "Direct to doorstep",
      focusLabel: "Instant commerce",
    },
  ] satisfies Service[],
};

export const work = {
  heading: ["Out there.", "Making an", "Impression"],
  eyebrow: "[03 // Out in the world]",
  intro: "Click an animation or View more to explore formats, media planning and campaign services. Illustrative formats; campaign stories to follow.",
  conceptLabel: "Illustrative concept",
  exploreLabel: "View more",
  mediaUnavailable: "This illustration could not load. You can still explore the format below.",
  playbackBlocked: "Open the details to play the illustration.",
  detailLabel: "Illustrative format — not a completed campaign",
  closeLabel: "Close format details",
  detailsLabel: "Campaign services",
  catalogueHint: "Relevant services are expanded below. Open any other category to explore the full offering.",
  contactLabel: "Plan a campaign",
  examples: [
    { title: "In the neighbourhood.", type: "Residential & community", video: "/videos/Card_01_New.mp4", alt: "Animated residential advertising environment", copy: "From a lobby screen to a society activation, sampling drive or door-to-door campaign, bring your brand into everyday community life.", formats: ["Society advertising", "Digital screens", "Community activations", "Sampling distribution"], serviceIds: ["btl", "digital"] },
    { title: "Along the everyday route.", type: "Outdoor & transit", video: "/videos/Card_02_New.mp4", alt: "Animated street with branded transport and roadside advertising", copy: "Explore outdoor and transit formats, from bus, metro and train branding to auto, cab and roadside placements.", formats: ["Outdoor digital", "Bus, metro & train branding", "Auto & cab branding", "Pole kiosks"], serviceIds: ["ooh", "atl"] },
    { title: "Part of the working day.", type: "Corporate & coworking", video: "/videos/Card_03_New.mp4", alt: "Animated office lobby with advertising screens", copy: "Meet audiences at work through office placements and workplace activations.", formats: ["Office advertising", "Coworking campaigns", "Workplace activations"], serviceIds: ["btl", "digital"] },
  ],
  note: "Campaign packs to be added",
  placeholder: {
    photo: "Campaign photograph to be added",
    client: "Client name",
    service: "Service and location",
    description: "Campaign details coming soon",
  },
  projects: [
    { id: "p1", featured: true, client: null, service: null, location: null, description: null, photos: [], results: null, details: null },
    { id: "p2", client: null, service: null, location: null, description: null, photos: [], results: null, details: null },
    { id: "p3", client: null, service: null, location: null, description: null, photos: [], results: null, details: null },
  ] as Project[],
};

export const about = {
  heading: "Committed to commitments.",
  positioning: "Where brand promise meets consumer desire.",
  copy: "We started with a simple belief: great advertising should create visibility that truly works for brands.",
  story: "That belief has shaped our journey from a focused advertising team into a full-service agency. Today, we deliver end-to-end solutions across ATL, BTL, OOH, digital and branded content, helping brands stand out on the platforms that matter to their audience.",
  services: "From society activations and transit branding to television, podcasts and film integrations, we pair creative ideas with strategic media planning, audience mapping and cost-effective buying.",
  strategy: "The right media. The right place. The right strategy. All working together to help your brand get noticed and remembered.",
  cta: "Let’s connect",
  reasonsLabel: "Why brands choose The Ad Company",
  reasons: [
    { title: "Strategic planning", copy: "Your audience, objectives and budget shape the media plan." },
    { title: "Pan-India presence", copy: "Campaign planning and execution across India, with media matched to each location." },
    { title: "Timely execution", copy: "Clear timelines and coordination from planning through rollout." },
    { title: "Transparent pricing", copy: "Clear costs and an agreed scope before your campaign moves forward." },
    { title: "End-to-end support", copy: "Support from the first brief through media buying and campaign execution." },
  ],
  brandVisual: { src: "/brand/billboard.jpg", width: 1080, height: 1350, alt: "The Ad Company logo on a freestanding billboard in a city street, shown as an illustrative brand placement.", caption: "The world is our canvas.", note: "Brand visual · illustrative placement" },
  photoPlaceholder: "Team or execution photograph to be added",
  /** Proposed process — copy kept plain and editable. */
  process: [
    {
      title: "Understand the brief",
      copy: "We start with your brand, your audience and your goals, so every recommendation has a clear purpose.",
    },
    {
      title: "Plan the placements",
      copy: "We map your audience and locations, then plan and buy the media that fits your campaign and budget, with clear pricing.",
    },
    {
      title: "Execute the campaign",
      copy: "We coordinate your campaign across the chosen platforms, with agreed timelines and support from brief to rollout.",
    },
  ],
};

export const coverage = {
  heading: "Where we work.",
  label: "Cities and regions",
  intro: "Pan-India presence. Campaigns planned for local audiences.",
  explore: "Explore a campaign in",
  visualNote: "Illustrative city scene · campaign photographs to follow",
  interactionHint: "Scroll to travel. Select a city to explore.",
  cta: "Discuss availability",
  previous: "Previous location",
  next: "Next location",
  pendingNote: "Planning across India. Specific locations and media availability are confirmed for your brief.",
  locations: [
    { name: "Mumbai", kind: "City", state: "Maharashtra" },
    { name: "Pune", kind: "City", state: "Maharashtra" },
    { name: "Bengaluru", kind: "City", state: "Karnataka" },
    { name: "Hyderabad", kind: "City", state: "Telangana" },
    { name: "Dharashiv", kind: "City", state: "Maharashtra" },
    { name: "Latur", kind: "City", state: "Maharashtra" },
    { name: "Gujarat", kind: "State / region" },
  ] satisfies Location[],
};

export interface TeamPointerNode {
  id: string;
  number: string;
  stageTitle: string;
  memberName: string;
  roleTitle: string;
  responsibility: string;
  introCopy: string;
  biography: string[];
  theme: 'stone' | 'lime' | 'charcoal';
  cutoutUrl: string;
  worldPos: { x: number; z: number; yaw: number }; // Alternating zig-zag 3D coordinates
  cardSide: 'right' | 'left';
}

export const TEAM_POINTER_NODES: TeamPointerNode[] = [
  {
    id: 'pointer-01',
    number: '01',
    stageTitle: 'THE VISION.',
    memberName: 'Yash Nile',
    roleTitle: 'Director | The AD Company',
    responsibility: 'The guy turning big ideas into bigger campaigns.',
    introCopy: '“Building an agency that believes in big ideas and honest execution.”',
    biography: ["Building The AD Company with one simple belief: great advertising isn't just about visibility; it's about making things happen. From building client relationships to cracking new opportunities and bringing ambitious ideas to life, I'm here to build an agency that plays big, delivers honestly, and never compromises on execution."],
    theme: 'stone',
    cutoutUrl: '/team/yash.webp',
    worldPos: { x: 0, z: 0, yaw: 0 },
    cardSide: 'right',
  },
  {
    id: 'pointer-02',
    number: '02',
    stageTitle: 'THE OPPORTUNITIES.',
    memberName: 'Akshay Daundkar',
    roleTitle: 'Media Sales Manager',
    responsibility: 'The dealmaker who knows where the next opportunity is.',
    introCopy: 'Always thinking strategically, he\'s all about finding the right opportunities, creating value, and making things happen for our clients.',
    biography: ["At The AD Company, Akshay focuses on business growth, building strong client relationships, and turning conversations into campaigns. Always thinking strategically, he's all about finding the right opportunities, creating value, and making things happen for our clients."],
    theme: 'lime',
    cutoutUrl: '/team/akshay.webp',
    worldPos: { x: 420, z: -650, yaw: -14 },
    cardSide: 'right',
  },
  {
    id: 'pointer-03',
    number: '03',
    stageTitle: 'THE PLACES.',
    memberName: 'Dilip Janaskar',
    roleTitle: 'Ad Sales Executive',
    responsibility: 'Finding the right space for brands to make some noise.',
    introCopy: 'Connect brands with the right audiences and turn advertising opportunities into real-world impact.',
    biography: ['From OOH advertising and society branding to BTL activations and on-ground promotions, Dilip helps brands get noticed where it matters. His mission? Connect brands with the right audiences and turn advertising opportunities into real-world impact.'],
    theme: 'charcoal',
    cutoutUrl: '/team/dilip.webp',
    worldPos: { x: -380, z: -1300, yaw: 14 },
    cardSide: 'left',
  },
  {
    id: 'pointer-04',
    number: '04',
    stageTitle: 'THE OWNERSHIP.',
    memberName: 'Mansi Jha',
    roleTitle: 'Social Media Manager',
    responsibility: 'The multitasker who treats The AD Company like her own.',
    introCopy: 'Always switched on. Always taking ownership. Always making things happen.',
    biography: [
      "Mansi is much more than the person behind our social media. She's one of those people who takes ownership, steps up whenever needed, and puts her heart into everything she does. Whether it's creating content, managing social media, coordinating tasks, or handling the unexpected, she brings the same level of dedication to every responsibility.",
      "Her ability to juggle multiple tasks while staying committed to the bigger picture makes her an incredible asset to the team. Always ready to step in, find solutions, and get things done, Mansi works with the mindset that The AD Company isn't just where she works — it's something she's helping build.",
      'Always switched on. Always taking ownership. Always making things happen.',
    ],
    theme: 'stone',
    cutoutUrl: '/team/mansi.webp',
    worldPos: { x: 420, z: -1950, yaw: -14 },
    cardSide: 'right',
  },
  {
    id: 'pointer-05',
    number: '05',
    stageTitle: 'THE GROUND.',
    memberName: 'Ashika Jha',
    roleTitle: 'BTL Head',
    responsibility: 'Where the plan meets the ground.',
    introCopy: 'She\'s focused on getting the details right, making every execution count, and ensuring that what we promise is what gets delivered.',
    biography: ["Ashika leads the on-ground action at The AD Company, bringing society activations, brand promotions, and BTL campaigns to life. She's focused on getting the details right, making every execution count, and ensuring that what we promise is what gets delivered."],
    theme: 'lime',
    cutoutUrl: '/team/ashika.webp',
    worldPos: { x: 0, z: -2600, yaw: 0 },
    cardSide: 'left',
  },
];

export const team = {
  eyebrow: "[06 // People make it happen]",
  heading: ["The people behind", "the placements."],
  hint: "Scroll back and forth: one pointer at a time.",
  note: "Big ideas. Honest execution. Meet The AD Company.",
  readBio: "Read full bio",
  closeBio: "Close biography",
  previous: "Prev pointer",
  next: "Next pointer",
  skip: "Continue to your campaign brief",
  members: TEAM_POINTER_NODES,
};
export const contact = {
  heading: ["Got a brand", "to put out there?"],
  copy: "Planning a local activation or a campaign across India? Tell us your audience, goals, budget and timeline. We’ll help you explore the right media, locations and execution plan.",
  submitLabel: "Request a callback",
  whatsappLabel: "Chat on WhatsApp",
  briefNote: "Prepare your campaign brief here, then share it by email or WhatsApp. You can also call us directly.",
  downloadStatus: "Your brief is ready to download. Nothing has been sent yet. Share the file using the email or WhatsApp links on this page.",
  privacyNote: "Your form details remain in this browser tab until you leave or refresh. Downloading creates a text file on your device; no form data is sent to a server or saved in browser storage. Email, phone and WhatsApp links open their respective apps, where you choose what to send. This site loads its typefaces from Google Fonts. Automatic enquiry delivery and a full business privacy notice are pending.",
  privacy:
    "Development version: this form is not connected to a destination yet. Details you submit are checked and then discarded — they are not stored, forwarded or shared. A full privacy notice will be added before launch.",
};

export const footer = {
  copyright: "© 2026 The Ad Company.",
  buildNote: "First website build. Campaign portfolio awaiting confirmation.",
};
