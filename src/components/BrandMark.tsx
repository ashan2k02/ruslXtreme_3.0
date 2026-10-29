import { Orbit } from 'lucide-react'

interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <a className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} href="#home" aria-label="RUSLXTREME 3.0 home">
      <span className="brand-mark__orb" aria-hidden="true"><Orbit size={compact ? 17 : 20} strokeWidth={1.8} /></span>
      <span className="brand-mark__type">
        <strong>RUSL</strong><span>XTREME</span>
        {!compact && <small>MISSION 03 / CODE BEYOND</small>}
      </span>
    </a>
  )
}
