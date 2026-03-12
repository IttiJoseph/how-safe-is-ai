// SVG filter components for petri dish rendering

export function dishFilterId(categoryId) {
  return `dish-filter-${categoryId}`
}

// React component — renders a hidden SVG containing a feTurbulence+feDisplacementMap filter.
// Apply to canvas via CSS: filter: url(#dish-filter-{categoryId})
// Each category gets a unique turbulence seed for visual variety.
export function DishFilter({ categoryId }) {
  const id = dishFilterId(categoryId)
  const seed = (hashStr(categoryId) % 89) + 1 // 1–89, unique per category

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.032"
            numOctaves="3"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

function hashStr(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
