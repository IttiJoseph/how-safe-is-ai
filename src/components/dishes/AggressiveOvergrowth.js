// AggressiveOvergrowth: dense jittered grid of circular colonies filling the dish
// Denial of Service — resource exhaustion, overgrowth consuming everything
import {
  seededRandom, hashStr,
  hexToRgb, tintColor, shadeColor,
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

  for (const dot of state.dots) {
    if (dot.patched) { ctx.save(); ctx.filter = 'saturate(0.2) brightness(1.1)' }

    const [rr, gg, bb] = hexToRgb(dot.color)
    ctx.save()
    ctx.globalAlpha = dot.alpha
    ctx.fillStyle = `rgb(${rr},${gg},${bb})`
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `rgba(${Math.round(rr*0.55)},${Math.round(gg*0.55)},${Math.round(bb*0.55)},0.32)`
    ctx.lineWidth = 0.8
    ctx.stroke()
    ctx.restore()

    if (dot.patched) ctx.restore()
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const totalCVEs = cves.length || 10
  const dotR = 5 + Math.sqrt(totalCVEs) * 0.5
  const spacing = dotR * 2.5

  const colors = [
    category.colors.primary,
    tintColor(category.colors.primary, 0.32),
    category.colors.secondary,
    shadeColor(category.colors.primary, 0.30),
    tintColor(category.colors.secondary, 0.28),
  ]

  state.dots = []
  for (let x = cx - dishR + dotR; x < cx + dishR - dotR; x += spacing) {
    for (let y = cy - dishR + dotR; y < cy + dishR - dotR; y += spacing) {
      const jx = x + (rng() - 0.5) * spacing * 0.65
      const jy = y + (rng() - 0.5) * spacing * 0.65
      if (Math.hypot(jx - cx, jy - cy) > dishR * 0.91) continue
      state.dots.push({
        x: jx,
        y: jy,
        r: dotR * (0.55 + rng() * 0.72),
        color: colors[Math.floor(rng() * colors.length)],
        alpha: 0.72 + rng() * 0.24,
        patched: rng() > 0.58,
      })
    }
  }

  state.particles = initParticles(14, dishR, rng)
  state.initialized = true
}
