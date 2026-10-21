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
};

export type Project = {
  id: string;
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

export type TeamMember = {
  name: string | null;
  role: string | null;
  responsibility: string | null;
  photo: { src: string; alt: string } | null;
};

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
  heading: "Brands we’ve worked with",
  note: "Logos to be added",
  names: [
    "Toyota India",
    "Maruti Suzuki India",
    "Milkbasket",
    "Truemeds",
    "Apollo Diagnostics",
    "Suburban Diagnostics",
    "Nova IVF Fertility",
    "Decathlon India",
  ],
};

/** Provisional offerings awaiting final business confirmation. */
export const services = {
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
    },
    {
      id: "corporate",
      index: "02",
      title: "Corporate & coworking",
      lead: "Connect with people where their working day happens.",
      formats: ["Corporate office advertising", "Coworking-space campaigns", "Workplace activations"],
      visualLabel: "Office & coworking",
    },
    {
      id: "outdoor",
      index: "03",
      title: "Outdoor & transit",
      lead: "Build visibility across streets and moving journeys.",
      formats: ["Outdoor digital advertising", "Transit advertising", "Auto branding", "Cab branding"],
      visualLabel: "Street & transit",
    },
    {
      id: "cinema",
      index: "04",
      title: "Cinema, airports & in-flight",
      lead: "Reach audiences across entertainment and travel.",
      formats: ["Cinema advertising", "Airport advertising", "In-flight advertising"],
      visualLabel: "Cinema & airport",
    },
    {
      id: "delivery",
      index: "05",
      title: "Delivery & in-app",
      lead: "Show up at the doorstep and on the screen.",
      formats: ["Delivery flyer campaigns", "In-app advertising"],
      visualLabel: "Doorstep & app",
    },
  ] satisfies Service[],
};

export const work = {
  heading: ["Out there.", "Making an impression."],
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
  ] satisfies Project[],
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

export const team = {
  heading: ["The people behind", "the placements."],
  note: "Team roster to be confirmed.",
  members: Array.from({ length: 6 }, () => ({
    name: null,
    role: null,
    responsibility: null,
    photo: null,
  })) as TeamMember[],
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
