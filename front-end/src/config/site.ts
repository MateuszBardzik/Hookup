/**
 * Site content you will most likely want to change.
 * No code changes needed elsewhere: edit the values here.
 */

/** Text + icon cards used by several sections. `icon` names are listed in components/icons.tsx → CategoryIcon / FeatureIcon. */
export interface Feature {
  icon: string
  title: string
  text: string
}

export interface Service extends Feature {
  id: string // used in links: /services#<id>
  details: string // longer text on the Services page
  bullets: string[]
  image: string // illustration in front-end/public/services/
}

export interface Tool {
  name: string
  category: 'pcb' | '3d'
  logo?: string
  color?: string
}

export const site = {
  name: 'engivexlab', // written in lowercase everywhere, like the logo
  logo: '/logo.svg', // file in front-end/public/

  /**
   * Landing-page hero (top of the page).
   *   highlight  part of the title shown in italics, highlight colour (must appear in title)
   *   image      picture in front-end/public/. Its moving parts are placed in HeroEffects.tsx
   *              (positions in picture pixels), so update those if you change the picture.
   *   chips      short facts under the buttons
   */
  hero: {
    eyebrow: 'Now hiring experts',
    title: 'Shape the tools behind every board, model & character.',
    highlight: 'board, model & character.',
    subtitle:
      'We test CAD & 3D design plugins and create expert AI-training data. Join our remote team of engineers, designers and annotators — paid per task.',
    primaryCta: 'Join our team',
    secondaryCta: 'See open roles',
    chips: ['PCB & product CAD', '3D & character design', 'AI training data'],
    image: '/hero-engivexlab.webp',
    alt: 'Experts at work on glass cards: a PCB board, a QA checklist, a 3D mesh part, an annotated cube and image labelling',
    status: '', // small pill on the picture (empty = hidden)
    caption: '', // short line on the picture's top-left corner (empty = hidden)
  },

  /**
   * Tools shown in the scrolling strip under the hero image.
   *   name      shown on the pill
   *   category  'pcb' or '3d' — picks the fallback icon and the small label
   *   logo      optional image in front-end/public/tools/, e.g. '/tools/kicad.svg'.
   *             Use the official logo from each company's brand/press page.
   *             Logos are shown in grey and turn to full colour on hover.
   *   color     optional hover colour (e.g. the brand colour). Default: site teal.
   * Add as many as you like — the strip scrolls forever.
   */
  toolsHeading: 'Works with the tools you already know',
  tools: [
    { name: 'Altium Designer', category: 'pcb', logo: '', color: '' },
    { name: 'KiCAD', category: 'pcb', logo: '', color: '' },
    { name: 'Blender 3D', category: '3d', logo: '', color: '' },
    { name: 'Allegro', category: 'pcb', logo: '', color: '' },
    { name: 'Maya', category: '3d', logo: '', color: '' },
  ] as Tool[],

  /**
   * Landing-page "open roles" section (cards come from the positions table).
   */
  rolesSection: {
    badge: 'Current opportunities',
    title: 'Choose work that fits your craft.',
    subtitle:
      'Short, focused testing tasks for PCB designers, hardware engineers, 3D modelers and character artists, with clear instructions and pay for every completed task.',
    viewAll: 'View all roles',
    maxShown: 3, // how many roles the home page lists; the rest are on the Careers page
  },

  /** Landing-page feedback section (cards come from the testimonials table). */
  feedbackSection: {
    badge: 'Shared experience',
    title: 'What vendors and users say',
  },

  /** Landing-page FAQ section (questions come from the faqs table). */
  faqSection: {
    badge: 'Good to know',
    title: 'Frequently asked questions',
    subtitle: 'Everything you need to know before you apply.',
  },

  /**
   * Navigation bar (header). `to` is a page address; '/about#contact' jumps to the contact form.
   */
  nav: [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'Careers', to: '/careers' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/about#contact' },
  ],
  joinCta: 'Join our team', // header button (logged out) -> sign-up

  /**
   * "Our services": 4 cards on the landing page, full sections on /services.
   * icon: 'annotation' | 'ai_training' | 'evaluation' | 'qa' | 'pcb' | '3d' | 'character'
   */
  servicesSection: {
    badge: 'What we do',
    title: 'Our services',
    subtitle: 'Expert QA for design tools and high-quality data for AI — delivered by specialists who know the domain.',
    pageTitle: 'Our services',
    pageSubtitle: 'High-quality testing, data and evaluation services that make design tools and AI models better.',
  },
  services: [
    {
      id: 'qa-testing',
      icon: 'qa',
      title: 'Plugin QA testing',
      text: 'Hands-on testing of CAD, PCB and 3D plugins by engineers and artists who use the tools every day.',
      details:
        'Our testers run real projects in KiCAD, Altium, Allegro, Blender and Maya, follow structured test plans and report issues with clear steps, files and screenshots.',
      bullets: ['Regression & release testing', 'Usability and workflow feedback', 'Clear, reproducible bug reports'],
      image: '/services/qa.svg',
    },
    {
      id: 'data-annotation',
      icon: 'annotation',
      title: 'Data annotation',
      text: 'Accurate labels for images, video, text, audio and 3D data — at the quality AI needs.',
      details:
        'We label images, videos, text, audio and 3D/CAD data, including object detection, segmentation, classification and labelling of schematics and models.',
      bullets: ['Image & video annotation', 'Text & audio labelling', 'Bounding boxes, polygons, masks'],
      image: '/services/annotation.svg',
    },
    {
      id: 'ai-training-data',
      icon: 'ai_training',
      title: 'AI training data',
      text: 'Expert-written datasets for training and fine-tuning models, including engineering and design tasks.',
      details:
        'Domain experts create high-quality, structured datasets for model training and fine-tuning: engineering problems, design tasks, step-by-step solutions and conversations.',
      bullets: ['Curated and cleaned data', 'Domain-specific datasets (EE, CAD, 3D)', 'LLM training data'],
      image: '/services/ai-data.svg',
    },
    {
      id: 'ai-evaluation',
      icon: 'evaluation',
      title: 'AI/LLM evaluation',
      text: 'Expert review of model answers: ratings, rankings, prompt testing and red-teaming.',
      details:
        'We evaluate model outputs, test prompts and measure performance so your models are accurate, safe and genuinely useful to professionals.',
      bullets: ['Response evaluation', 'Prompt testing', 'Human preference ranking'],
      image: '/services/evaluation.svg',
    },
  ] as Service[],

  /** "Why work with us?" (landing page). icon: 'clock' | 'pay' | 'book' | 'users' */
  whySection: { badge: 'For our experts', title: 'Why work with us?' },
  why: [
    { icon: 'clock', title: 'Flexible work', text: 'Work from home, on your own schedule.' },
    { icon: 'pay', title: 'Competitive pay', text: 'Get paid for every completed task.' },
    { icon: 'book', title: 'Training & support', text: 'Paid training and a team that answers your questions.' },
    { icon: 'users', title: 'Global community', text: 'Join engineers, artists and annotators worldwide.' },
  ] as Feature[],

  /** "Our hiring process" (landing page + Careers page). Keep 5 steps: they match the dashboard. */
  hiringSection: { badge: 'How it works', title: 'Our hiring process' },
  hiringSteps: [
    { title: 'Apply', text: 'Fill in the online application.' },
    { title: 'Qualification test', text: 'A short test of your skills.' },
    { title: 'ID verification', text: 'We confirm who you are.' },
    { title: 'Training', text: 'Paid onboarding and guidelines.' },
    { title: 'Project work', text: 'Start working and earning.' },
  ],

  /** Dark banner near the bottom of the landing page. */
  joinBanner: {
    title: 'Join our team',
    text: 'Help build better design tools and better AI. Apply today and become part of our growing team of testers, annotators and AI evaluators.',
    cta: 'View open positions',
  },

  /** Careers page (/careers). icon: 'monitor' | 'language' | 'eye' | 'target' */
  careers: {
    title: 'Join our team',
    subtitle: 'Flexible opportunities. Meaningful work. Help shape the tools and the AI of tomorrow.',
    positionsTitle: 'Open positions',
    skillsTitle: 'Required skills',
    skills: [
      { icon: 'monitor', title: 'Computer literacy', text: '' },
      { icon: 'language', title: 'Good English', text: '' },
      { icon: 'eye', title: 'Attention to detail', text: '' },
      { icon: 'target', title: 'Reliability', text: '' },
    ] as Feature[],
    ctaTitle: 'Ready to get started?',
    ctaText: 'Apply today and take the first step toward a rewarding opportunity.',
  },

  /** Apply page (/apply). */
  apply: {
    title: 'Apply for a position',
    subtitle: "Fill out the form below and tell us about yourself. We'll review your application and get back to you soon.",
    termsText: 'I agree to the Terms & Conditions and Privacy Policy',
  },

  /** About page (/about). icon for values: 'target' | 'users' | 'shield' | 'heart' */
  about: {
    title: 'About us',
    subtitle:
      'A team of engineers and artists building better design tools — and a better AI future — through careful testing, high-quality data and human expertise.',
    missionTitle: 'Our mission',
    mission:
      'To help build better design tools and AI by providing expert testing, high-quality data and evaluation services, while creating meaningful, flexible work for skilled people around the world.',
    missionImage: '/about/mission.svg',
    missionCaption: 'Better data. Better tools. Brighter future.',
    valuesTitle: 'Our values',
    values: [
      { icon: 'target', title: 'Quality', text: 'We deliver accurate, reliable and consistent results.' },
      { icon: 'users', title: 'People', text: 'We value our team and support their growth.' },
      { icon: 'shield', title: 'Integrity', text: 'We work with transparency and honesty.' },
      { icon: 'heart', title: 'Impact', text: 'We help build tools and AI that make a real difference.' },
    ] as Feature[],
    teamTitle: 'Our team',
    team:
      'We are a diverse team of engineers, 3D artists and AI specialists. Together with our community of testers and annotators, we deliver work our clients can rely on — and create opportunities for talented people worldwide.',
    teamImage: '/about/team.svg',
  },

  /** Contact section (About page). Messages are saved to the database (admin pages → Contact messages). */
  contact: {
    title: 'Contact us',
    text: "Have a question? We'd love to hear from you.",
    email: 'support@engivexlab.com', // shown with a mail link; change to your real address
    location: 'Remote · United States, Canada, Brazil',
  },

  /** Footer social links: empty = hidden. */
  social: {
    linkedin: '',
    x: '',
    discord: '',
  },

  /** Worker portal (/portal) sidebar title. */
  portalTitle: 'Worker portal',

  footerText: 'Expert testing and AI-training data for design tools.',
}
