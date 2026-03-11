import PetriDish from './PetriDish.jsx'
import styles from './LabBench.module.css'

export default function LabBench({ categories, cves, categoryStats, selectedDish, onSelectDish }) {
  const anySelected = selectedDish !== null

  return (
    <section className={styles.bench}>
      <div className={styles.benchInner}>
        <div className={styles.grid}>
          {categories.map((category) => {
            const categoryCves = cves.filter(c => c.category === category.id)
            const stats = categoryStats[category.id] || {}
            return (
              <PetriDish
                key={category.id}
                category={category}
                cves={categoryCves}
                stats={stats}
                isSelected={selectedDish === category.id}
                isFaded={anySelected && selectedDish !== category.id}
                onSelect={() => onSelectDish(
                  selectedDish === category.id ? null : category.id
                )}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
