// SupplyChain: Poisson-disc sampled colonies, each product a distinct color
// Colony size ∝ √(CVE count). Dark agar background. White particles.
import {
  seededRandom, hashStr, computeProductClusters,
  computeBlobShape, drawOrganicBlob, drawGlow,
  hexToRgb, initParticles, drawParticles,
} from '../../utils/rendering.js'

// Fixed 8-color palette for product colonies — vivid, distinct
const COLONY_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#ff6bcd', '#a855f7', '#06d6a0', '#f77f00',
]

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
      const pulse = 0.5 + 0.45 * Math.sin((time / 780) * Math.PI * 2)
      drawGlow(ctx, colony.x, colony.y, colony.r, colony.color, pulse)
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

  const maxR = dishR * 0.28
  const radii = topClusters.map(c => 8 + Math.sqrt(c.count / maxCount) * maxR)
  const minDist = Math.max(...radii) * 2.2

  const positions = poissonDisc(topClusters.length, dishR * 0.88, minDist, cx, cy, rng)

  state.colonies = topClusters.map((cluster, i) => {
    const pos = positions[i] || { x: cx, y: cy }
    return {
      x: pos.x,
      y: pos.y,
      r: Math.min(radii[i], maxR),
      color: COLONY_COLORS[i % COLONY_COLORS.length],
      alpha: 0.72 + (1 - cluster.patchedFraction) * 0.22,
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
      shape: computeBlobShape(8, seededRandom(hashStr(cluster.product + '-sc'))),
    }
  })

  state.particles = initParticles(22, dishR, rng)
  state.initialized = true
}
