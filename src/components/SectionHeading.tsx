interface SectionHeadingProps {
  eyebrow: string
  title: string
  copy: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, copy, align = 'left' }: SectionHeadingProps) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <div className="section-heading__eyebrow"><span className="eyebrow-dot" />{eyebrow}</div>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  )
}
