// WebNodes: scattered nodes connected by thin lines — a semantic network
// Vector/Embedding — high-dimensional space, fuzzy attack boundaries
import {
  seededRandom, hashStr, computeProductClusters,
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

  // Edges first
  for (const edge of state.edges) {
    ctx.save()
    ctx.globalAlpha = edge.alpha
    ctx.strokeStyle = `rgb(${rr},${gg},${bb})`
    ctx.lineWidth = edge.width
    ctx.beginPath()
    ctx.moveTo(edge.x1, edge.y1)
    ctx.lineTo(edge.x2, edge.y2)
    ctx.stroke()
    ctx.restore()
  }

  // Nodes on top
  for (const node of state.nodes) {
    if (node.patched) { ctx.save(); ctx.filter = 'saturate(0.2) brightness(1.1)' }

    const [nr, ng, nb] = hexToRgb(node.color)
    ctx.save()
    ctx.globalAlpha = node.alpha
    ctx.fillStyle = `rgb(${nr},${ng},${nb})`
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = `rgba(${Math.round(nr*0.55)},${Math.round(ng*0.55)},${Math.round(nb*0.55)},0.38)`
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.restore()

    if (node.patched) ctx.restore()
  }

  drawParticles(ctx, cx, cy, category.colors.accent || category.colors.primary, state.particles, time)
  ctx.restore()
  ctx.restore()
}

function initState(state, cves, category, dishR, cx, cy) {
  const rng = seededRandom(hashStr(category.id))
  const clusters = computeProductClusters(cves)
  const maxCount = clusters[0]?.count || 1
  const colors = [
    category.colors.primary,
    category.colors.secondary,
    tintColor(category.colors.primary, 0.38),
    tintColor(category.colors.secondary, 0.30),
  ]

  state.nodes = clusters.slice(0, 14).map((cluster, i) => {
    const angle = rng() * Math.PI * 2
    const dist = rng() * dishR * 0.84
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: 4 + Math.sqrt(cluster.count / maxCount) * dishR * 0.13,
      color: colors[i % colors.length],
      alpha: 0.76 + (1 - cluster.patchedFraction) * 0.20,
      patched: cluster.patchedFraction > 0.65,
      exploited: cluster.hasExploited,
    }
  })

  // Edges between nearby nodes
  state.edges = []
  const maxDist = dishR * 0.52
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < state.nodes.length; j++) {
      const d = Math.hypot(state.nodes[i].x - state.nodes[j].x, state.nodes[i].y - state.nodes[j].y)
      if (d < maxDist && rng() > 0.28) {
        state.edges.push({
          x1: state.nodes[i].x, y1: state.nodes[i].y,
          x2: state.nodes[j].x, y2: state.nodes[j].y,
          alpha: 0.10 + (1 - d / maxDist) * 0.28,
          width: 0.7 + (1 - d / maxDist) * 1.3,
        })
      }
    }
  }

  state.particles = initParticles(16, dishR, rng)
  state.initialized = true
}
