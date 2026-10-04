// Small generic line icons (not brand logos). They use the current text colour.
type IconProps = { size?: number }

const base = (size: number) => ({
  viewBox: '0 0 24 24',
  width: size,
  height: size,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export function ChipIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9h3.5M2.5 15h3.5M18 9h3.5M18 15h3.5" />
    </svg>
  )
}

export function CubeIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 2.8 20 7.3v9.4L12 21.2 4 16.7V7.3z" />
      <path d="M4 7.3 12 11.8l8-4.5M12 11.8v9.4" />
    </svg>
  )
}

export function CharacterIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <ellipse cx="12" cy="14" rx="7" ry="7.5" />
      <path d="M12 6.5V4M12 4c1.2-1.6 3.2-2 4.6-1.2-1 1.6-3 2-4.6 1.2zM12 4c-1-1.3-2.7-1.6-3.8-1 .8 1.3 2.5 1.6 3.8 1z" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M9.8 16.2c1.3 1.1 3.1 1.1 4.4 0" />
    </svg>
  )
}

export function BriefcaseIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18" />
    </svg>
  )
}

export function PinIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  )
}

export function GlobeIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  )
}

export function PayIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19M6.5 15h4" />
    </svg>
  )
}

export function SparkIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  )
}

export function ArrowIcon({
  size = 18,
  direction = 'right',
  diagonal = false,
}: IconProps & { direction?: 'left' | 'right'; diagonal?: boolean }) {
  const transform = diagonal ? 'rotate(-45deg)' : direction === 'left' ? 'scaleX(-1)' : undefined
  return (
    <svg {...base(size)} style={{ transform }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/* ---------- Services / careers / about ---------- */

export function TagIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7l9 9-9.2 9.2z" />
      <circle cx="8" cy="8" r="1.6" />
    </svg>
  )
}

export function BrainIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.3A3 3 0 0 0 7 18a2.5 2.5 0 0 0 5 .5V6a2.5 2.5 0 0 0-3-1.5z" />
      <path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.3A3 3 0 0 1 17 18a2.5 2.5 0 0 1-5 .5" />
      <path d="M12 6a2.5 2.5 0 0 1 3-1.5M8 11h1.5M14.5 11H16" />
    </svg>
  )
}

export function ChatCheckIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" />
      <path d="m8.5 12 2.3 2.3 4.7-4.6" />
    </svg>
  )
}

export function ShieldIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  )
}

export function ClockIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function UsersIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c.6-3.3 3-5.3 6-5.3s5.4 2 6 5.3" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.6c1.6.8 2.7 2.4 3 4.9" />
    </svg>
  )
}

export function HeartIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.4 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z" />
    </svg>
  )
}

export function TargetIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  )
}

export function MailIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  )
}

export function MonitorIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8.5 20h7M12 16v4" />
    </svg>
  )
}

export function LanguageIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5h9M8.5 3v2M6 5c.5 3.5 2.5 6 5.5 7.5M11 5c-.6 3.6-2.8 6.6-6.5 8.5" />
      <path d="m12.5 21 4-9 4 9M14 17.5h5" />
    </svg>
  )
}

export function EyeIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/* ---------- Navigation / portal ---------- */

export function MenuIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function GridIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function StepsIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="5" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <path d="M5 8v8M10 6h10M10 18h10M10 12h7" />
    </svg>
  )
}

export function BookIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5M8 7.5h8" />
    </svg>
  )
}

export function ClipboardIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 4.5V3.5h6v1M8.5 10h7M8.5 13.5h7M8.5 17h4" />
    </svg>
  )
}

export function FolderIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

export function ListCheckIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="m3.5 6.5 1.5 1.5 3-3M3.5 12.5 5 14l3-3M3.5 18.5 5 20l3-3M11 7h9.5M11 13h9.5M11 19h9.5" />
    </svg>
  )
}

export function WalletIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <rect x="4" y="8" width="16.5" height="11" rx="2" />
      <path d="M16.5 13.5h1.5" />
    </svg>
  )
}

export function UserIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
    </svg>
  )
}

export function LogoutIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" />
    </svg>
  )
}

export function ChevronIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function UploadIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  )
}

/* ---------- Social (simple generic marks) ---------- */

export function LinkedInIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.5v.01M12 16v-5.5M12 13c0-1.6 1-2.5 2.3-2.5S16.5 11.4 16.5 13v3" />
    </svg>
  )
}

export function XIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4.5 4h4l11 16h-4zM19.5 4l-6.2 7M10.7 13 4.5 20" />
    </svg>
  )
}

export function ChatIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 11.5a7.5 7.5 0 0 1-10.8 6.7L4 20l1.6-4.4A7.5 7.5 0 1 1 20 11.5z" />
    </svg>
  )
}

/** Mechanical CAD part: a bracket with a hole and a dimension line */
export function CadIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 20V8h6v6h10v6Z" />
      <circle cx="7" cy="11" r="1.2" />
      <path d="M4 4h16M4 2.5v3M20 2.5v3" />
    </svg>
  )
}

/** Game engine: a gamepad */
export function EngineIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M7 7h10a5 5 0 0 1 4.6 7l-.9 2.2a2.4 2.4 0 0 1-4 .6L15 15H9l-1.7 1.8a2.4 2.4 0 0 1-4-.6L2.4 14A5 5 0 0 1 7 7Z" />
      <path d="M7.5 10v3M6 11.5h3M15.5 11h.01M17.5 12.5h.01" />
    </svg>
  )
}

export function HomeIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  )
}

/** A document with lines: "project-based" */
export function ProjectIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6 3h8l4 4v14H6Z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </svg>
  )
}

/** Pointer clicking on a screen: "expert demonstrations" */
export function DemoIcon({ size = 22 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h5" />
      <path d="m13 13 7.5 2.8-3.2 1.3-1.3 3.2Z" />
    </svg>
  )
}

/** Icon for a position / service category (used by cards on several pages). */
export function CategoryIcon({ category, size = 22 }: { category: string; size?: number }) {
  switch (category) {
    case 'pcb':
      return <ChipIcon size={size} />
    case '3d':
      return <CubeIcon size={size} />
    case 'character':
      return <CharacterIcon size={size} />
    case 'annotation':
      return <TagIcon size={size} />
    case 'ai_training':
      return <BrainIcon size={size} />
    case 'evaluation':
      return <ChatCheckIcon size={size} />
    case 'demo':
      return <DemoIcon size={size} />
    case 'qa':
      return <ShieldIcon size={size} />
    default:
      return <BriefcaseIcon size={size} />
  }
}

/** Icon for a feature card (why us, skills, values). Names are used in config/site.ts. */
export function FeatureIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  switch (icon) {
    case 'clock':
      return <ClockIcon size={size} />
    case 'pay':
      return <PayIcon size={size} />
    case 'book':
      return <BookIcon size={size} />
    case 'users':
      return <UsersIcon size={size} />
    case 'monitor':
      return <MonitorIcon size={size} />
    case 'language':
      return <LanguageIcon size={size} />
    case 'eye':
      return <EyeIcon size={size} />
    case 'target':
      return <TargetIcon size={size} />
    case 'shield':
      return <ShieldIcon size={size} />
    case 'heart':
      return <HeartIcon size={size} />
    case 'cube':
      return <CubeIcon size={size} />
    case 'wallet':
      return <WalletIcon size={size} />
    case 'home':
      return <HomeIcon size={size} />
    case 'project':
      return <ProjectIcon size={size} />
    default:
      return <CategoryIcon category={icon} size={size} />
  }
}

/** Small icon on a tool pill ("Works with the tools you already know"), by tool category. */
export function ToolIcon({ category, size = 18 }: { category: string; size?: number }) {
  switch (category) {
    case 'pcb':
      return <ChipIcon size={size} />
    case '3d':
      return <CubeIcon size={size} />
    case 'cad':
      return <CadIcon size={size} />
    case 'engine':
      return <EngineIcon size={size} />
    default:
      return <GridIcon size={size} />
  }
}
