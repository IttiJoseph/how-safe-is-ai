// SupplyChain: Poisson-disc sampled colonies, each product a distinct color
// Colony size ∝ √(CVE count). Dark agar background. White particles.
import {
  seededRandom, hashStr, computeProductClusters,
  computeBlobShape, drawOrganicBlob, drawSubtleRing,
  tintColor, initParticles, drawParticles,
} from '../../utils/rendering.js'

export function draw(canvas, categoryData, options = {}) {
  if (!canvas) return
  const { category, cves } = categoryData
  const { time = 0, scale = 1, state = {} } = options

  const size = canvas.width
  const cx = size / 2
  const cy = size / 2
  const dishR = size / 2 - 2

  if (!state.initialized) initState(state, cves, category, dishR, cx, cy)

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, dishR, 0, Math.PI * 2)
  ctx.clip()

  // Dark agar fill (overrides the CSS agar color for supply chain)
  ctx.fillStyle = '#111118'
  ctx.fillRect(0, 0, size, size)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  for (const colony of state.colonies) {
    if (colony.patched) {
      ctx.save()
      ctx.filter = 'saturate(0.18) brightness(0.9)'
    }
    drawOrganicBlob(ctx, colony.x, colony.y, colony.r, colony.color, colony.alpha, colony.shape)
    if (colony.patched) ctx.restore()

    if (colony.exploited) {
      drawSubtleRing(ctx, colony.x, colony.y, colony.r, colony.color)
    }
  }

  // White particles on dark agar
  drawParticles(ctx, cx, cy, '#ffffff', state.particles, time)

  ctx.restore()
  ctx.restore()
}

// Poisson disc sampling — ensures colonies don't overlap
function poissonDisc(count, dishR, minDist, cx, cy, rng) {
  const pts = []
  let attempts = 0
  while (pts.length < count && attempts < count * 30) {
    attempts++
    const angle = rng() * Math.PI * 2
    const dist = rng() * dishR * 0.82
    const x = cx + Math.cos(angle) * dist
    const y = cy + Math.sin(angle) * dist
    const tooClose = pts.some(p => Math.hypot(p.x - x, p.y - y) < minDist)
    if (!tooClose) pts.push({ x, y })
  }
  return pts
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const clusters = computeProductClusters(cves)
  const maxCount = clusters[0]?.count || 1
  const topClusters = clusters.slice(0, 8)

  const maxR = dishR * 0.36
  const radii = topClusters.map(c => 10 + Math.sqrt(c.count / maxCount) * maxR)
  const minDist = Math.max(...radii) * 2.2

  const positions = poissonDisc(topClusters.length, dishR * 0.88, minDist, cx, cy, rng)
  const p = category.colors.primary
  const s = category.colors.secondary
  const palette = [
    p,
    tintColor(p, 0.30),
    tintColor(p, 0.55),
    tintColor(p, 0.75),
    s,
    tintColor(s, 0.30),
    tintColor(s, 0.55),
    tintColor(p, 0.40),
  ]

  state.colonies = topClusters.map((cluster, i) => {
    const pos = positions[i] || { x: cx, y: cy }
    return {
      x: pos.x,
      y: pos.y,
      r: Math.min(radii[i], maxR),
      color: palette[i % palette.length],
      alpha: 0.90 + (1 - cluster.patchedFraction) * 0.08,
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
      shape: computeBlobShape(8, seededRandom(hashStr(cluster.product + '-sc'))),
    }
  })

  state.particles = initParticles(22, dishR, rng)
  state.initialized = true
}
