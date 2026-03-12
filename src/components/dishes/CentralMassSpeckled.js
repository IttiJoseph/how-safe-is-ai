// CentralMassSpeckled: large central blob + scattered spore dots radiating outward
// Model Poisoning — corrupts from within, speckled contamination spreading at edges
import {
  seededRandom, hashStr,
  computeBlobShape, drawOrganicBlob, drawSubtleRing,
  initParticles, drawParticles,
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

  // Spore dots behind the central mass
  for (const spore of state.spores) {
    if (spore.patched) { ctx.save(); ctx.filter = 'saturate(0.15) brightness(1.1)' }
    ctx.save()
    ctx.globalAlpha = spore.alpha
    ctx.fillStyle = spore.color
    ctx.beginPath()
    ctx.arc(spore.x, spore.y, spore.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    if (spore.patched) ctx.restore()
  }

  // Central mass on top
  drawOrganicBlob(ctx, cx, cy, state.centralR, category.colors.primary, 0.94, state.centralShape)
  if (state.hasExploited) {
    drawSubtleRing(ctx, cx, cy, state.centralR, category.colors.secondary)
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const totalCVEs = cves.length || 10

  state.centralR = Math.min(dishR * 0.24 + Math.sqrt(totalCVEs) * 2.2, dishR * 0.38)
  state.centralShape = computeBlobShape(10, seededRandom(hashStr(category.id + '-c')))
  state.hasExploited = cves.some(c => c.exploited)

  const sporeCount = Math.min(Math.max(14, Math.floor(totalCVEs * 0.85)), 45)
  const colors = [category.colors.primary, category.colors.secondary, category.colors.accent || category.colors.primary]

  state.spores = Array.from({ length: sporeCount }, () => {
    const angle = rng() * Math.PI * 2
    const minDist = state.centralR * 1.1
    const dist = minDist + rng() * (dishR * 0.88 - minDist)
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: 2 + rng() * 7,
      color: colors[Math.floor(rng() * colors.length)],
      alpha: 0.5 + rng() * 0.45,
      patched: rng() > 0.55,
    }
  })

  state.particles = initParticles(20, dishR, rng)
  state.initialized = true
}
