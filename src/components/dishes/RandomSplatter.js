// RandomSplatter: scattered ellipses at random angles
// Improper Output Handling — outputs spray unpredictably in all directions
import {
  seededRandom, hashStr,
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

  for (const splat of state.splats) {
    if (splat.patched) { ctx.save(); ctx.filter = 'saturate(0.2) brightness(1.1)' }

    ctx.save()
    ctx.globalAlpha = splat.alpha
    ctx.translate(splat.x, splat.y)
    ctx.rotate(splat.angle)
    const [rr, gg, bb] = hexToRgb(splat.color)
    ctx.fillStyle = `rgb(${rr},${gg},${bb})`
    ctx.beginPath()
    ctx.ellipse(0, 0, splat.rx, splat.ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `rgba(${Math.round(rr*0.58)},${Math.round(gg*0.58)},${Math.round(bb*0.58)},0.38)`
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.restore()

    if (splat.patched) ctx.restore()
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const totalCVEs = cves.length || 10
  const splatCount = Math.min(Math.max(20, Math.floor(totalCVEs * 0.55)), 38)
  const colors = [category.colors.primary, category.colors.secondary]

  state.splats = Array.from({ length: splatCount }, (_, i) => {
    const angle = rng() * Math.PI * 2
    const dist = Math.sqrt(rng()) * dishR * 0.84
    const base = 11 + rng() * dishR * 0.22
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      angle: rng() * Math.PI * 2,
      rx: base,
      ry: base * (0.38 + rng() * 0.52),
      color: colors[i % colors.length],
      alpha: 0.65 + rng() * 0.30,
      patched: rng() > 0.6,
      exploited: false,
    }
  })

  state.particles = initParticles(18, dishR, rng)
  state.initialized = true
}
