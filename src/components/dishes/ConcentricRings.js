// ConcentricRings: each product cluster = stacked concentric circle strokes
// Data Leakage — data seeps through concentric boundaries it shouldn't cross
import {
  seededRandom, hashStr, computeProductClusters,
  hexToRgb, initParticles, drawParticles,
} from '../../utils/rendering.js'

const ZONES = {
  critical: [0.05, 0.42],
  high:     [0.25, 0.60],
  medium:   [0.48, 0.76],
  low:      [0.64, 0.88],
}

export function draw(canvas, categoryData, options = {}) {
  if (!canvas) return
  const { category, cves } = categoryData
  const { time = 0, scale = 1, state = {} } = options

  const size = canvas.width
  const cx = size / 2, cy = size / 2
  const dishR = size / 2 - 2

  if (!state.initialized) initState(state, cves, category, dishR, cx, cy)

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, dishR, 0, Math.PI * 2)
  ctx.clip()

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  const [rr, gg, bb] = hexToRgb(category.colors.primary)

  for (const g of state.groups) {
    if (g.patched) { ctx.save(); ctx.filter = 'saturate(0.2) brightness(1.1)' }

    // Draw rings outward → inward so inner rings paint on top
    for (let i = g.rings; i >= 1; i--) {
      const ringR = (i / g.rings) * g.maxR
      // Outer rings more transparent, inner rings more opaque
      const alpha = 0.22 + (1 - i / g.rings) * 0.68
      const width = 1.5 + (g.rings - i) * 0.6
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.strokeStyle = `rgb(${rr},${gg},${bb})`
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.arc(g.x, g.y, ringR, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Solid center dot
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.fillStyle = `rgb(${rr},${gg},${bb})`
    ctx.beginPath()
    ctx.arc(g.x, g.y, g.maxR * 0.13, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    if (g.patched) ctx.restore()
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const clusters = computeProductClusters(cves)
  const maxCount = clusters[0]?.count || 1

  state.groups = clusters.slice(0, 10).map(cluster => {
    const productCves = cves.filter(c => c.product === cluster.product)
    const maxSev = ['critical', 'high', 'medium', 'low']
      .find(s => productCves.some(c => c.severity === s)) || 'medium'
    const [zMin, zMax] = ZONES[maxSev]
    const angle = rng() * Math.PI * 2
    const dist = (zMin + rng() * (zMax - zMin)) * dishR
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      maxR: Math.min(22 + Math.sqrt(cluster.count / maxCount) * dishR * 0.44, dishR * 0.52),
      rings: 3 + Math.floor(rng() * 3),
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
    }
  })

  state.particles = initParticles(20, dishR, rng)
  state.initialized = true
}
