// DefaultPattern: organic metaball blobs, one per product cluster
// Fallback for all dishes without a unique pattern algorithm
import {
  seededRandom, hashStr, computeProductClusters,
  computeBlobShape, drawOrganicBlob, drawGlow,
  initParticles, drawParticles,
} from '../../utils/rendering.js'

// Severity → spatial zone as fraction of dish radius
const ZONES = {
  critical: [0.00, 0.28],
  high:     [0.20, 0.50],
  medium:   [0.45, 0.70],
  low:      [0.65, 0.88],
}

export function draw(canvas, categoryData, options = {}) {
  if (!canvas) return
  const { category, stats, cves } = categoryData
  const { time = 0, scale = 1, state = {} } = options

  const size = canvas.width
  const cx = size / 2
  const cy = size / 2
  const dishR = size / 2 - 2

  if (!state.initialized) initState(state, cves, category, dishR, cx, cy)

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)

  // Clip to dish circle
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, dishR, 0, Math.PI * 2)
  ctx.clip()

  // Breathing scale transform
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-cx, -cy)

  for (const blob of state.blobs) {
    if (blob.patched) {
      ctx.save()
      ctx.filter = 'saturate(0.2) brightness(1.12)'
    }
    drawOrganicBlob(ctx, blob.x, blob.y, blob.r, blob.color, blob.alpha, blob.shape)
    if (blob.patched) ctx.restore()

    if (blob.exploited) {
      const pulse = 0.42 + 0.42 * Math.sin((time / 850) * Math.PI * 2)
      drawGlow(ctx, blob.x, blob.y, blob.r, blob.color, pulse)
    }
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)

  ctx.restore() // breathing
  ctx.restore() // clip
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const clusters = computeProductClusters(cves)
  const maxCount = clusters[0]?.count || 1

  state.blobs = clusters.slice(0, 12).map(cluster => {
    const productCves = cves.filter(c => c.product === cluster.product)
    const maxSev = ['critical', 'high', 'medium', 'low']
      .find(s => productCves.some(c => c.severity === s)) || 'medium'
    const [zMin, zMax] = ZONES[maxSev]

    const angle = rng() * Math.PI * 2
    const dist = (zMin + rng() * (zMax - zMin)) * dishR
    const r = 9 + Math.sqrt(cluster.count / maxCount) * dishR * 0.30

    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: Math.min(r, dishR * 0.36),
      color: cluster.patchedFraction > 0.75 ? category.colors.secondary : category.colors.primary,
      alpha: 0.52 + (1 - cluster.patchedFraction) * 0.38,
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
      shape: computeBlobShape(8, seededRandom(hashStr(cluster.product))),
    }
  })

  state.particles = initParticles(28, dishR, rng)
  state.initialized = true
}
