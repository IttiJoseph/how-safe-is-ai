// SatelliteClusters: central blob + smaller satellite blobs with dashed connector lines
// Agentic Autonomy — central cluster spawning uncontrolled satellite actions
import {
  seededRandom, hashStr, computeProductClusters,
  computeBlobShape, drawOrganicBlob, drawSubtleRing,
  hexToRgb, initParticles, drawParticles,
} from '../../utils/rendering.js'

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

  // Dashed connector lines behind blobs
  for (const sat of state.satellites) {
    ctx.save()
    ctx.globalAlpha = 0.20
    ctx.strokeStyle = `rgb(${rr},${gg},${bb})`
    ctx.lineWidth = 1.0
    ctx.setLineDash([3, 5])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(sat.x, sat.y)
    ctx.stroke()
    ctx.restore()
  }

  // Satellite blobs
  for (const sat of state.satellites) {
    if (sat.patched) { ctx.save(); ctx.filter = 'saturate(0.2) brightness(1.1)' }
    drawOrganicBlob(ctx, sat.x, sat.y, sat.r, sat.color, sat.alpha, sat.shape)
    if (sat.exploited) drawSubtleRing(ctx, sat.x, sat.y, sat.r, sat.color)
    if (sat.patched) ctx.restore()
  }

  // Central cluster on top
  drawOrganicBlob(ctx, cx, cy, state.centralR, category.colors.primary, 0.94, state.centralShape)
  drawSubtleRing(ctx, cx, cy, state.centralR, category.colors.primary)

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const clusters = computeProductClusters(cves)
  const totalCVEs = cves.length || 10
  const maxCount = clusters[0]?.count || 1

  state.centralR = Math.min(dishR * 0.18 + Math.sqrt(totalCVEs) * 1.8, dishR * 0.30)
  state.centralShape = computeBlobShape(10, seededRandom(hashStr(category.id + '-c')))

  const satCount = Math.max(3, Math.min(7, clusters.length))
  state.satellites = clusters.slice(0, satCount).map((cluster, i) => {
    const angle = (i / satCount) * Math.PI * 2 + rng() * 0.55
    const dist = dishR * (0.36 + rng() * 0.40)
    const r = 9 + Math.sqrt(cluster.count / maxCount) * dishR * 0.22
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: Math.min(r, dishR * 0.28),
      color: cluster.patchedFraction > 0.75 ? category.colors.secondary : category.colors.primary,
      alpha: 0.76 + (1 - cluster.patchedFraction) * 0.18,
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
      shape: computeBlobShape(8, seededRandom(hashStr(cluster.product + '-sat'))),
    }
  })

  state.particles = initParticles(18, dishR, rng)
  state.initialized = true
}
