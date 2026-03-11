// PromptInjection: central blob + radiating tendrils via random-walk paths, forking once
// Tendril count scales with CVE count. Exploited CVEs add glow at tendril tips.
import {
  seededRandom, hashStr,
  computeBlobShape, drawOrganicBlob, drawGlow,
  hexToRgb, initParticles, drawParticles,
} from '../../utils/rendering.js'

export function draw(canvas, categoryData, options = {}) {
  if (!canvas) return
  const { category, stats, cves } = categoryData
  const { time = 0, scale = 1, state = {} } = options

  const size = canvas.width
  const cx = size / 2
  const cy = size / 2
  const dishR = size / 2 - 2

  if (!state.initialized) initState(state, cves, stats, category, dishR, cx, cy)

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

  // Draw tendrils (behind the central blob)
  for (const t of state.tendrils) {
    strokePath(ctx, t.main, t.width, `rgba(${rr},${gg},${bb},0.72)`)
    if (t.fork) {
      strokePath(ctx, t.fork, t.width * 0.55, `rgba(${rr},${gg},${bb},0.42)`)
    }
    if (t.exploited) {
      const pulse = 0.38 + 0.38 * Math.sin((time / 900) * Math.PI * 2)
      const tip = t.main[t.main.length - 1]
      drawGlow(ctx, tip.x, tip.y, t.width * 4, category.colors.primary, pulse)
    }
  }

  // Central blob on top
  drawOrganicBlob(ctx, cx, cy, state.centralR, category.colors.secondary, 0.92, state.centralShape)

  // Ambient core glow
  const corePulse = 0.22 + 0.14 * Math.sin((time / 3500) * Math.PI * 2)
  drawGlow(ctx, cx, cy, state.centralR, category.colors.primary, corePulse)

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)

  ctx.restore()
  ctx.restore()
}

function strokePath(ctx, pts, width, color) {
  if (pts.length < 2) return
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length - 1; i++) {
    const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 }
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y)
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
  ctx.stroke()
  ctx.restore()
}

// Random-walk from (startX, startY) toward an angle, growing outward
function walkPath(startX, startY, angle, length, steps, rng) {
  const pts = [{ x: startX, y: startY }]
  let a = angle
  const step = length / steps
  for (let i = 1; i <= steps; i++) {
    a += (rng() - 0.5) * 0.28
    pts.push({ x: pts[i - 1].x + Math.cos(a) * step, y: pts[i - 1].y + Math.sin(a) * step })
  }
  return pts
}

function initState(state, cves, stats, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const totalCVEs = stats.totalCVEs || cves.length || 10
  const N = Math.max(3, Math.min(10, Math.floor(totalCVEs / 4)))
  const exploitedCount = cves.filter(c => c.exploited).length

  state.tendrils = Array.from({ length: N }, (_, i) => {
    const baseAngle = (i / N) * Math.PI * 2 + rng() * 0.35
    const tendrilLen = dishR * (0.72 + rng() * 0.22)
    const main = walkPath(cx, cy, baseAngle, tendrilLen, 16, rng)

    // Fork from ~60% along the main tendril
    const forkIdx = Math.floor(main.length * (0.55 + rng() * 0.15))
    const forkStart = main[forkIdx]
    const forkAngle = baseAngle + (rng() > 0.5 ? 1 : -1) * (0.45 + rng() * 0.4)
    const forkRng = seededRandom(hashStr(`${category.id}-f${i}`))
    const distLeft = tendrilLen * (1 - forkIdx / main.length) * 0.85
    const fork = walkPath(forkStart.x, forkStart.y, forkAngle, distLeft, 10, forkRng)

    return {
      main,
      fork,
      width: 1.8 + rng() * 2.2,
      exploited: i < exploitedCount,
    }
  })

  state.centralR = Math.min(dishR * 0.16 + Math.sqrt(totalCVEs) * 1.8, dishR * 0.28)
  state.centralShape = computeBlobShape(10, seededRandom(hashStr(category.id + '-c')))
  state.particles = initParticles(18, dishR, rng)
  state.initialized = true
}
