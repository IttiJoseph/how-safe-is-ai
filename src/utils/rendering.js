// Shared canvas rendering utilities used by all dish draw() functions

// --- PRNG ---

// mulberry32: deterministic PRNG — same seed = same output every time
export function seededRandom(seed) {
  let s = (seed >>> 0) || 1
  return function () {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Hash a string to a uint32 (for seeding from category/product names)
export function hashStr(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// --- Data helpers ---

// Group CVEs by product → sorted array of clusters (largest first)
export function computeProductClusters(cves) {
  const map = {}
  for (const cve of cves) {
    const p = cve.product || 'Unknown'
    if (!map[p]) map[p] = { product: p, count: 0, hasExploited: false, patchedCount: 0 }
    map[p].count++
    if (cve.exploited) map[p].hasExploited = true
    if (cve.patched) map[p].patchedCount++
  }
  return Object.values(map)
    .map(c => ({ ...c, patchedFraction: c.count > 0 ? c.patchedCount / c.count : 0 }))
    .sort((a, b) => b.count - a.count)
}

// --- Color utilities ---

export function hexToRgb(hex) {
  const c = (hex || '#888888').replace('#', '')
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ]
}

// --- Blob shape ---

// Pre-compute N jittered control points for a blob (call once in init, reuse each frame)
export function computeBlobShape(n, rng) {
  return Array.from({ length: n }, (_, i) => ({
    angle: (i / n) * Math.PI * 2 - Math.PI / 2,
    jitter: 0.72 + rng() * 0.56, // 72%–128% of radius
  }))
}

// Draw an organic blob using pre-computed shape (stable across frames)
export function drawOrganicBlob(ctx, cx, cy, r, color, alpha, shape) {
  const pts = shape.map(p => ({
    x: cx + Math.cos(p.angle) * r * p.jitter,
    y: cy + Math.sin(p.angle) * r * p.jitter,
  }))

  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
  ctx.beginPath()
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i]
    const p1 = pts[(i + 1) % pts.length]
    const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
    if (i === 0) ctx.moveTo(mid.x, mid.y)
    ctx.quadraticCurveTo(p0.x, p0.y, mid.x, mid.y)
  }
  ctx.closePath()

  // Explicit rgba gradient to avoid black-fringe artifact with 'transparent'
  const [rr, gg, bb] = hexToRgb(color)
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  grad.addColorStop(0, `rgb(${rr},${gg},${bb})`)
  grad.addColorStop(1, `rgba(${rr},${gg},${bb},0)`)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

// Bioluminescent glow ring — 'screen' composite for additive light effect
export function drawGlow(ctx, cx, cy, r, color, intensity) {
  if (intensity <= 0.02) return
  const [rr, gg, bb] = hexToRgb(color)
  const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 2.5)
  grad.addColorStop(0, `rgba(${rr},${gg},${bb},${Math.min(intensity * 0.8, 1)})`)
  grad.addColorStop(0.4, `rgba(${rr},${gg},${bb},${intensity * 0.25})`)
  grad.addColorStop(1, `rgba(${rr},${gg},${bb},0)`)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// --- Particles ---

// Allocate particle array once in init()
export function initParticles(count, dishR, rng) {
  return Array.from({ length: count }, () => {
    const angle = rng() * Math.PI * 2
    const dist = rng() * dishR * 0.82
    return {
      x: Math.cos(angle) * dist, // offset from center
      y: Math.sin(angle) * dist,
      freq: 0.25 + rng() * 0.65,
      phaseX: rng() * Math.PI * 2,
      phaseY: rng() * Math.PI * 2,
      size: 0.6 + rng() * 1.1,
      alpha: 0.06 + rng() * 0.16,
    }
  })
}

// Draw slowly drifting speckle particles (cx, cy = dish center)
export function drawParticles(ctx, cx, cy, color, particles, time) {
  const [rr, gg, bb] = hexToRgb(color)
  const t = time * 0.00032
  ctx.save()
  for (const p of particles) {
    const px = cx + p.x + Math.sin(t * p.freq + p.phaseX) * 5
    const py = cy + p.y + Math.cos(t * p.freq + p.phaseY) * 5
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = `rgb(${rr},${gg},${bb})`
    ctx.beginPath()
    ctx.arc(px, py, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}
