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
  concept: "The city is our canvas.",
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

export const hero = {
  eyebrow: "On-ground advertising. Real-world presence.",
  headline: ["Your brand.", "Out in the", "real world."],
  copy: "We help brands show up across residential communities, workplaces, streets and screens through on-ground advertising and campaign execution.",
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

/** Provisional offerings awaiting final business confirmation. */
export const services = {
  eyebrow: "[02 // Where your brand can show up]",
  journeyHint: "Interactive 3D environment journey — scroll or click any vertical to explore.",
  loadingLabel: "Loading environment sequence",
  unavailable: "Some animation frames could not load. Showing the available illustration.",
  heading: ["Real places.", "Real brand presence."],
  intro:
    "Different environments. Different formats. One clear aim: put your brand where people are.",
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
      formats: ["Delivery flyer campaigns", "In-app advertising"],
      visualLabel: "Delivery & in-app",
      badge: "Direct to doorstep",
      focusLabel: "Instant commerce",
    },
  ] satisfies Service[],
};

export const work = {
  heading: ["Out there.", "Making an", "Impression"],
  eyebrow: "[03 // Out in the world]",
  intro: "A look at the possibilities. Illustrative formats; campaign stories to follow.",
  conceptLabel: "Illustrative concept",
  exploreLabel: "Explore the format",
  playLabel: "Play illustration",
  pauseLabel: "Pause illustration",
  mediaUnavailable: "This illustration could not load. You can still explore the format below.",
  playbackBlocked: "Tap to play the illustration.",
  detailLabel: "Illustrative format — not a completed campaign",
  closeLabel: "Close format details",
  contactLabel: "Plan a campaign",
  examples: [
    { title: "In the neighbourhood.", type: "Residential & community", video: "/videos/card_01.mp4", alt: "Animated residential advertising environment", copy: "From a lobby screen to a community activation, bring a brand into the places people call home.", formats: ["Society advertising", "Digital screens", "Community activations"] },
    { title: "Along the everyday route.", type: "Outdoor & transit", video: "/videos/card_02.mp4", alt: "Animated street with branded transport and roadside advertising", copy: "Build a presence along everyday journeys with outdoor placements and branded vehicles.", formats: ["Outdoor digital", "Auto & cab branding", "Transit advertising"] },
    { title: "Part of the working day.", type: "Corporate & coworking", video: "/videos/card_03.mp4", alt: "Animated office lobby with advertising screens", copy: "Meet audiences at work through office placements and workplace activations.", formats: ["Office advertising", "Coworking campaigns", "Workplace activations"] },
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
  copy: "The Ad Company helps brands connect with people through advertising in the places they live, work and move through.",
  photoPlaceholder: "Team or execution photograph to be added",
  /** Proposed process — copy kept plain and editable. */
  process: [
    {
      title: "Understand the brief",
      copy: "We start with what you want to achieve, who you want to reach and where.",
    },
    {
      title: "Plan the placements",
      copy: "We suggest the formats and locations that suit your brief and budget.",
    },
    {
      title: "Execute the campaign",
      copy: "We put the agreed plan into action on the ground.",
    },
  ],
};

export const coverage = {
  heading: "Where we work.",
  label: "Cities and regions",
  intro: "Pan-India possibilities. Local presence.",
  explore: "Explore a campaign in",
  visualNote: "Illustrative city scene · campaign photographs to follow",
  interactionHint: "Scroll to travel. Select a city to explore.",
  cta: "Discuss availability",
  previous: "Previous location",
  next: "Next location",
  pendingNote: "Provisional list — final coverage confirmation pending.",
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
  number: string;       // "01" .. "06"
  stageTitle: string;   // "THE BRIEF." .. "THE FOLLOW-THROUGH."
  memberName: string;
  roleTitle: string;
  responsibility: string;
  introCopy: string;
  theme: 'stone' | 'lime' | 'charcoal';
  cutoutUrl: string;    // Replaceable sample cutout URL
  worldPos: { x: number; z: number; yaw: number }; // Alternating zig-zag 3D coordinates
  cardSide: 'right' | 'left';
}

export const TEAM_POINTER_NODES: TeamPointerNode[] = [
  {
    id: 'pointer-01',
    number: '01',
    stageTitle: 'THE BRIEF.',
    memberName: 'Aarav Mehta',
    roleTitle: 'Client Strategy & Discovery Lead',
    responsibility: 'Brief intake, audience decoding & market goals',
    introCopy: 'Turns raw brand ambitions into sharp on-ground campaign briefs before a single site is booked.',
    theme: 'stone',
    cutoutUrl: '/team/sample-01.webp',
    worldPos: { x: 0, z: 0, yaw: 0 },
    cardSide: 'right',
  },
  {
    id: 'pointer-02',
    number: '02',
    stageTitle: 'THE PLAN.',
    memberName: 'Rohan Kulkarni',
    roleTitle: 'Media Planning & Route Architect',
    responsibility: 'City selection, frequency mapping & format mix',
    introCopy: 'Architects high-visibility daily commuter corridors across Mumbai, Pune, Bengaluru, and Gujarat.',
    theme: 'lime',
    cutoutUrl: '/team/sample-02.webp',
    worldPos: { x: 420, z: -650, yaw: -14 },
    cardSide: 'right',
  },
  {
    id: 'pointer-03',
    number: '03',
    stageTitle: 'THE PLACES.',
    memberName: 'Priya Nair',
    roleTitle: 'Location Scouting & Site Partnerships',
    responsibility: 'Premium residential, transit & corporate inventory',
    introCopy: 'Secures high-dwell-time placements at neighbourhood gates, arterial junctions, and coworking hubs.',
    theme: 'charcoal',
    cutoutUrl: '/team/sample-03.webp',
    worldPos: { x: -380, z: -1300, yaw: 14 },
    cardSide: 'left',
  },
  {
    id: 'pointer-04',
    number: '04',
    stageTitle: 'THE DETAILS.',
    memberName: 'Kabir Deshmukh',
    roleTitle: 'Creative Production & Technical Specs',
    responsibility: 'Format adaptation, DOOH calibration & print QA',
    introCopy: 'Obsesses over every pixel pitch, viewing distance, and material finish so every placement pops.',
    theme: 'stone',
    cutoutUrl: '/team/sample-04.webp',
    worldPos: { x: 420, z: -1950, yaw: -14 },
    cardSide: 'right',
  },
  {
    id: 'pointer-05',
    number: '05',
    stageTitle: 'THE GROUND.',
    memberName: 'Neha Joshi',
    roleTitle: 'On-Ground Execution & Field Operations',
    responsibility: 'Rigging, live installation & zero-delay rollout',
    introCopy: 'Leads field crews across every city to bring campaigns live on schedule and in pristine condition.',
    theme: 'lime',
    cutoutUrl: '/team/sample-05.webp',
    worldPos: { x: -380, z: -2600, yaw: 14 },
    cardSide: 'left',
  },
  {
    id: 'pointer-06',
    number: '06',
    stageTitle: 'THE FOLLOW-THROUGH.',
    memberName: 'Vikram Shah',
    roleTitle: 'Proof-of-Play, Analytics & Account Delivery',
    responsibility: 'Timestamped verification, uptime audits & reporting',
    introCopy: 'Closes the loop with verified on-ground proof-of-play telemetry and transparent post-campaign reports.',
    theme: 'charcoal',
    cutoutUrl: '/team/sample-06.webp',
    worldPos: { x: 0, z: -3250, yaw: 0 },
    cardSide: 'right',
  },
];

export const team = {
  eyebrow: "[06 // People make it happen]",
  heading: ["The people behind", "the placements."],
  hint: "Scroll back and forth: one pointer at a time.",
  note: "Sample profiles & stock portraits. Team roster awaiting confirmation.",
  previous: "Prev pointer",
  next: "Next pointer",
  skip: "Continue to your campaign brief",
  members: TEAM_POINTER_NODES,
};
export const contact = {
  heading: ["Got a brand", "to put out there?"],
  copy: "Tell us what you have in mind. Let’s talk about where your brand could show up next.",
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
  buildNote: "First website build. Campaign portfolio and team profiles are awaiting confirmation.",
};
