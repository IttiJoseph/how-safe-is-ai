import { useRef, useEffect } from 'react'
import { DishFilter, dishFilterId } from '../utils/filters.jsx'
import { draw as drawDefault } from './dishes/DefaultPattern.js'
import { draw as drawPromptInjection } from './dishes/PromptInjection.js'
import { draw as drawSupplyChain } from './dishes/SupplyChain.js'
import styles from './PetriDish.module.css'

const DRAW_FNS = {
  'radiating-tendrils': drawPromptInjection,
  'scattered-colonies': drawSupplyChain,
}

function getDishDraw(pattern) {
  return DRAW_FNS[pattern] ?? drawDefault
}

export default function PetriDish({ category, cves, stats, isSelected, isFaded, onSelect }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({})
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Reset state when category data changes
    stateRef.current = {}

    // Size canvas to match its CSS layout size (inset 3px from 220px dish = 214px)
    const size = canvas.offsetWidth || 214
    canvas.width = size
    canvas.height = size

    const drawFn = getDishDraw(category.pattern)
    const categoryData = { category, stats, cves }

    const loop = () => {
      const time = Date.now()
      const scale = 1 + 0.028 * Math.sin((time / 4000) * Math.PI * 2)
      drawFn(canvas, categoryData, { time, scale, highlight: null, state: stateRef.current })
      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [category.id, cves, stats])

  return (
    <div
      className={styles.wrapper}
      data-faded={isFaded || undefined}
      data-selected={isSelected || undefined}
      onClick={onSelect}
    >
      <div
        className={styles.dish}
        style={{ '--agar-color': category.colors.agar }}
        title={`${category.name} — ${stats.totalCVEs ?? 0} CVEs`}
      >
        <DishFilter categoryId={category.id} />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ filter: `url(#${dishFilterId(category.id)})` }}
        />
        <div className={styles.rim} />
      </div>
      <div className={styles.label}>
        <span className={styles.name}>{category.name}</span>
        <span className={styles.count}>{stats.totalCVEs ?? 0} CVEs</span>
      </div>
    </div>
  )
}
