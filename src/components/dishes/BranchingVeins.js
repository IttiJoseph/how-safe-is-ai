// BranchingVeins: recursive branching paths from center outward
// Model Theft — extraction veins reaching toward edges, pulling data out
import {
  seededRandom, hashStr,
  hexToRgb, tintColor,
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

  const [rr, gg, bb] = hexToRgb(category.colors.primary)

  // Draw branches (thicker/more opaque first)
  for (const b of state.branches) {
    ctx.save()
    ctx.globalAlpha = b.alpha
    ctx.strokeStyle = `rgb(${rr},${gg},${bb})`
    ctx.lineWidth = b.width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(b.x1, b.y1)
    ctx.lineTo(b.x2, b.y2)
    ctx.stroke()
    ctx.restore()
  }

  // Junction nodes
  for (const node of state.nodes) {
    ctx.save()
    ctx.globalAlpha = node.alpha
    ctx.fillStyle = `rgb(${rr},${gg},${bb})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // White accent center node
  ctx.save()
  ctx.globalAlpha = 0.88
  ctx.fillStyle = category.colors.accent || '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function growBranch(x1, y1, angle, length, depth, width, rng, branches, nodes) {
  if (depth === 0 || length < 5) return
  const x2 = x1 + Math.cos(angle) * length
  const y2 = y1 + Math.sin(angle) * length
  branches.push({ x1, y1, x2, y2, width, alpha: 0.45 + depth * 0.13 })
  if (depth > 1) {
    nodes.push({ x: x2, y: y2, r: width * 0.85, alpha: 0.7 + depth * 0.08 })
    const numSub = depth >= 3 ? 2 : (rng() > 0.35 ? 2 : 1)
    for (let i = 0; i < numSub; i++) {
      const spread = (i === 0 ? 1 : -1) * (0.32 + rng() * 0.42)
      growBranch(x2, y2, angle + spread, length * (0.58 + rng() * 0.24), depth - 1, width * 0.62, rng, branches, nodes)
    }
  }
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const totalCVEs = cves.length || 10
  const numRoots = Math.max(3, Math.min(7, Math.floor(totalCVEs / 5)))

  state.branches = []
  state.nodes = []
  for (let i = 0; i < numRoots; i++) {
    const angle = (i / numRoots) * Math.PI * 2 + rng() * 0.35
    growBranch(cx, cy, angle, dishR * (0.48 + rng() * 0.32), 3, 3.8 + rng() * 2.2, rng, state.branches, state.nodes)
  }

  state.particles = initParticles(16, dishR, rng)
  state.initialized = true
}
