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
    primaryCta: 'Join as an Expert',
    secondaryCta: 'See open opportunities',
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
  /** Small cue at the bottom of the first screen ('' = hidden); click scrolls to the next section */
  scrollCue: 'Scroll to explore',

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
    title: 'Put your expertise to work.',
    subtitle:
      'Join a global network of engineers, designers, and technical experts helping evaluate and improve AI for real-world engineering and design. Work on focused projects, choose opportunities that match your skills, and get paid for completed work.',
    viewAll: 'Explore opportunities',
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
    { label: 'About us', to: '/about' },
    { label: 'Contact', to: '/about#contact' },
  ],
  joinCta: 'Join as an Expert', // header button (logged out) -> sign-up

  /**
   * "What we do": 4 cards on the landing page (with one link under them), full sections on /services.
   * icon: 'evaluation' | 'demo' | 'qa' | 'annotation' | 'ai_training' | 'pcb' | '3d' | 'character'
   */
  servicesSection: {
    badge: 'What we do',
    title: 'Training AI for Professional Design',
    subtitle:
      'We work with engineering and 3D experts to evaluate and improve AI agents that create professional designs. From PCB design to 3D modeling, our experts test AI-generated work, evaluate the tools and plugins behind it, and provide feedback that makes AI more capable and reliable.',
    cta: { label: 'See how our evaluation process works', to: '/services' }, // link under the cards
    pageTitle: 'How we improve AI agents',
    pageSubtitle:
      'Our engineering and design experts evaluate AI agents on real-world tasks, test the tools they use, and provide expert feedback to improve their accuracy, reliability, and professional performance.',
  },
  services: [
    {
      id: 'agent-evaluation',
      icon: 'evaluation',
      title: 'AI agent evaluation',
      text: 'Evaluate AI agents on real-world engineering and design tasks. Assess whether their work is accurate, efficient, reliable, and aligned with professional standards.',
      details:
        'Experts evaluate how AI agents perform real-world tasks inside professional design software. They review the agent’s actions and final results against defined requirements and professional standards, identifying errors, inefficient steps, and workflow issues.',
      bullets: ['Task completion and accuracy', 'Quality and Efficiency of the workflow', 'Errors, unexpected behavior, and failures', 'File and project integrity'],
      image: '/services/evaluation.svg',
    },
    {
      id: 'expert-demonstrations',
      icon: 'demo',
      title: 'Expert workflows',
      text: 'Create professional reference examples that demonstrate how experienced engineers and designers perform tasks using tools such as Altium, KiCad, Blender, and Maya.',
      details:
        'Engineers and designers create high-quality examples of real-world tasks in professional software—from routing a PCB to modeling and rigging a 3D character. These examples capture the steps, decisions, and workflows experts use in practice.',
      bullets: ['Step-by-step expert workflows', 'Real tasks in professional software', 'Decisions and reasoning, not just actions'],
      image: '/services/ai-data.svg',
    },
    {
      id: 'plugin-qa',
      icon: 'qa',
      title: 'Environment & plugin QA',
      text: 'Test the software environments, plugins, and integrations that AI agents rely on. Identify compatibility issues, bugs, and workflow limitations to ensure reliable agent performance.',
      details:
        'We test the plugins, integrations, and software environments that AI agents rely on to work with tools such as KiCad, Altium, Allegro, Blender, and Maya. Using structured test plans, we identify issues and document them with clear, reproducible evidence.',
      bullets: ['Integration and regression testing', 'Compatibility across software versions', 'Clear, reproducible issue reports'],
      image: '/services/qa.svg',
    },
    {
      id: 'data-annotation',
      icon: 'annotation',
      title: 'Data annotation & quality review',
      text: 'Annotate and review AI agent actions, outputs, and multimodal data to create high-quality datasets for training, evaluation, and continuous improvement.',
      details:
        'Experts label, classify, and review AI-generated actions and outputs to create reliable datasets for training and evaluating AI agents. Tasks may include reviewing design files, screenshots, 3D models, action sequences, and final results.',
      bullets: ['Action and output annotation', 'Multimodal design data', 'Quality control and consistency'],
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
      title: 'Evaluate AI work',
      text: 'Review AI-generated PCB, CAD, and 3D work. Identify errors, missing steps, and areas where the AI agent can improve.',
    },
    {
      icon: 'cube',
      title: 'Provide expert workflows',
      text: 'Demonstrate how experienced professionals approach real-world design tasks using industry-standard tools and workflows.',
    },
    {
      icon: 'wallet',
      title: 'Get paid for your expertise',
      text: "Complete eligible projects and earn based on the work you deliver. You'll see the requirements, scope, and compensation before accepting a task.",
    },
  ] as Feature[],

  /** "Our hiring process" (landing page + Careers page). Keep 5 steps: they match the dashboard. */
  hiringSection: {
    badge: 'How it works',
    title: 'From application to project work.',
    subtitle:
      'A simple process to qualify, verify, and connect skilled professionals with AI evaluation and training projects.',
  },
  hiringSteps: [
    { title: 'Apply', text: 'Tell us about your skills, experience, and areas of expertise.' },
    { title: 'Qualification test', text: 'Complete a short practical task to demonstrate your skills.' },
    { title: 'ID verification', text: 'Complete a short practical task to demonstrate your skills.' },
    { title: 'Onboarding', text: 'Review project guidelines, tools, and evaluation standards. Paid onboarding may be provided for eligible projects.' },
    { title: 'Project work', text: 'Get matched with relevant projects, complete tasks, and get paid for your work.' },
  ],

  /** Dark banner near the bottom of the landing page. */
  joinBanner: {
    title: 'Join our expert network',
    text: 'Help shape better AI for professional engineering and design. Apply to work on focused evaluation, testing, and training projects as part of our growing network of engineers, designers, and AI evaluators.',
    cta: 'View open opportunities',
  },

  /** Careers page (/careers). icon: 'monitor' | 'language' | 'eye' | 'target' */
  careers: {
    title: 'Join as an Expert',
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
    ctaText: 'Put your expertise to work and help improve AI agents for real-world engineering and design. Apply today to join our expert network.',
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
      'To help build better AI and design tools through expert evaluation, rigorous testing, and high-quality data—while creating meaningful project opportunities for skilled professionals around the world.',
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
      'We are a multidisciplinary team of engineers, 3D artists, and AI specialists working together to build better AI for professional engineering and design. Alongside our global network of expert contributors, we evaluate AI agents, test professional tools and workflows, and produce high-quality data that helps improve AI performance.',
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
    'Join our global network of engineers, designers, and technical experts working on AI evaluation, testing, and training for professional engineering and design tools.',
  /** Short facts under the footer text. icon: 'home' | 'project' | 'users' */
  footerFacts: [
    { icon: 'home', label: 'Remote' },
    { icon: 'project', label: 'Project-based' },
    { icon: 'users', label: 'Global expert network' },
  ],
}
