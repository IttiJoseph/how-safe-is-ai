import styles from './PetriDish.module.css'

export default function PetriDish({ category, cves, stats, isSelected, isFaded, onSelect }) {
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
        <div className={styles.rim} />
        <div className={styles.agar} />
      </div>
      <div className={styles.label}>
        <span className={styles.name}>{category.name}</span>
        <span className={styles.count}>{stats.totalCVEs ?? 0} CVEs</span>
      </div>
    </div>
  )
}
