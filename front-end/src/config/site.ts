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
  category: 'pcb' | '3d' | 'cad' | 'engine'
  logo?: string
  color?: string
}

export const site = {
  name: 'engivexlab', // written in lowercase everywhere, like the logo
  logo: '/logo.png', // file in front-end/public/ (also used as the browser-tab icon: favicon-32.png)

  /**
   * Landing-page hero (top of the page).
   *   highlight  part of the title shown in italics, highlight colour (must appear in title)
   *   highlightOnNewLine  true = the highlighted words always start on a new line
   *   image      picture in front-end/public/. Its moving parts are placed in HeroEffects.tsx
   *              (positions in picture pixels), so update those if you change the picture.
   *   chips      short facts under the buttons
   */
  hero: {
    eyebrow: 'AI agents × human experts',
    title: 'Help AI agents work like experts.',
    highlight: 'work like experts.',
    highlightOnNewLine: true, // start the highlighted words on a new line
    subtitle:
      'Use your PCB, CAD or 3D skills to evaluate AI work, create expert examples and get paid for project-based contributions.',
    primaryCta: 'Join our team',
    secondaryCta: 'See open roles',
    chips: ['PCB & product CAD', '3D & character design', 'AI training data'],
    image: '/hero-engivexlab.webp',
    alt: 'Experts at work on glass cards: a PCB board, a QA checklist, a 3D mesh part, an annotated cube and image labelling',
    status: '', // small pill on the picture (empty = hidden)
    caption: '', // short line on the picture's top-left corner (empty = hidden)
  },

  /**
   * Tools in the scrolling strip under the hero ("Works with the tools you already know").
   *   name      shown on the pill
   *   category  'pcb' | '3d' | 'cad' | 'engine' — picks the small icon on the pill
   *   logo      the official logo, a file in front-end/public/tools/ (get it from the company's
   *             brand / press page). Until the file is there, the pill shows a small stand-in icon.
   *   color     colour of the icon (e.g. the brand colour)
   * Add as many as you like — the strip scrolls forever (it stops while the mouse is over it).
   */
  toolsHeading: 'Works with the tools you already know',
  tools: [
    { name: 'KiCAD', category: 'pcb', logo: '/tools/kicad.svg', color: '#314cb0' },
    { name: 'Altium Designer', category: 'pcb', logo: '/tools/altium.svg', color: '#a07b2c' },
    { name: 'Allegro', category: 'pcb', logo: '/tools/allegro.svg', color: '#c8102e' },
    { name: 'Blender 3D', category: '3d', logo: '/tools/blender.svg', color: '#e87d0d' },
    { name: 'Maya', category: '3d', logo: '/tools/maya.svg', color: '#1a9fb5' },
    { name: '3D MAX', category: '3d', logo: '/tools/3dsmax.svg', color: '#0b8ea5' },
    { name: 'Unity', category: 'engine', logo: '/tools/unity.svg', color: '#222c37' },
    { name: 'Solid Works', category: 'cad', logo: '/tools/solidworks.svg', color: '#da291c' },
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
   * "What we do": 4 cards on the landing page (with one link under them), full sections on /services.
   * icon: 'evaluation' | 'demo' | 'qa' | 'annotation' | 'ai_training' | 'pcb' | '3d' | 'character'
   */
  servicesSection: {
    badge: 'What we do',
    title: 'How we improve AI agents',
    subtitle:
      'Our experts help evaluate, train and improve AI agents that work inside professional engineering and 3D software.',
    cta: { label: 'See how our evaluation process works', to: '/services' }, // link under the cards
    pageTitle: 'How we improve AI agents',
    pageSubtitle:
      'Our experts help evaluate, train and improve AI agents that work inside professional engineering and 3D software.',
  },
  services: [
    {
      id: 'agent-evaluation',
      icon: 'evaluation',
      title: 'AI agent evaluation',
      text: 'Review whether an agent completed a PCB, CAD or 3D task correctly, efficiently and safely.',
      details:
        'Experts replay what an AI agent did inside the real tool, check the result against professional standards and score each step: was the task completed, was it done the right way, and did anything break along the way.',
      bullets: ['Task completion and correctness', 'Efficiency of the steps taken', 'Safety: no damaged files or settings'],
      image: '/services/evaluation.svg',
    },
    {
      id: 'expert-demonstrations',
      icon: 'demo',
      title: 'Expert demonstrations',
      text: 'Create high-quality examples that show how professionals use Altium, KiCAD, Blender and Maya.',
      details:
        'Engineers and artists record how they actually solve real tasks — from routing a board to rigging a character — with clear steps and reasoning, so agents learn the professional way of working.',
      bullets: ['Step-by-step task recordings', 'Real projects in professional tools', 'Explained decisions, not just clicks'],
      image: '/services/ai-data.svg',
    },
    {
      id: 'plugin-qa',
      icon: 'qa',
      title: 'Environment & plugin QA',
      text: 'Test the integrations that allow AI agents to interact reliably with professional software.',
      details:
        'We test the plugins and environments that connect AI agents to KiCAD, Altium, Allegro, Blender and Maya, follow structured test plans and report issues with clear steps, files and screenshots.',
      bullets: ['Integration and regression testing', 'Reliability across tool versions', 'Clear, reproducible bug reports'],
      image: '/services/qa.svg',
    },
    {
      id: 'data-annotation',
      icon: 'annotation',
      title: 'Data annotation & review',
      text: 'Label and structure agent actions, outputs and multimodal data for evaluation and training.',
      details:
        'We label and organise what agents see and do — screenshots, designs, 3D models, action logs and results — so the data can be used to evaluate and train them.',
      bullets: ['Agent action and output labelling', 'Images, 3D models and design files', 'Consistent review guidelines'],
      image: '/services/annotation.svg',
    },
  ] as Service[],

  /**
   * "Why your expertise matters" (landing page): numbered cards.
   * icon: 'monitor' | 'cube' | 'wallet' | 'clock' | 'pay' | 'book' | 'users' | 'eye' | 'target' | 'shield' | 'heart'
   */
  whySection: { badge: '', title: 'Why your expertise matters' },
  why: [
    {
      icon: 'monitor',
      title: 'Review AI work',
      text: 'Check whether an AI agent completed a PCB, CAD or 3D task correctly, and identify mistakes or missing steps.',
    },
    {
      icon: 'cube',
      title: 'Show the right workflow',
      text: 'Create expert examples that demonstrate how professionals actually use the tools.',
    },
    {
      icon: 'wallet',
      title: 'Get paid for completed work',
      text: "Contribute to eligible projects and earn based on the tasks you complete. You'll see the rate and requirements before accepting.",
    },
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

  footerText:
    'Bring your engineering, design or QA expertise to help AI agents become more capable, reliable and useful in real-world tools.',
  /** Short facts under the footer text. icon: 'home' | 'project' | 'users' */
  footerFacts: [
    { icon: 'home', label: 'Remote' },
    { icon: 'project', label: 'Project-based' },
    { icon: 'users', label: 'Global community' },
  ],
}
