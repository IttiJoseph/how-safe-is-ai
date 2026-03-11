import styles from './IntroSection.module.css'

export default function IntroSection({ summary }) {
  const qoqSign = summary.quarterOverQuarterChange > 0 ? '+' : ''

  return (
    <section className={styles.intro}>
      <div className={styles.inner}>

        <div className={styles.eyebrow}>A live field study</div>
        <h1 className={styles.headline}>How Safe Is AI?</h1>

        <p className={styles.why}>
          Every AI system in production has a vulnerability record. This page tracks all known
          CVEs affecting AI models, frameworks, and infrastructure — updated every night from
          the NVD and GitHub Advisory Database. Each petri dish is a category of attack. The
          organisms growing inside are real vulnerabilities.
        </p>

        <div className={styles.howToRead}>
          <h2 className={styles.howToReadTitle}>How to read the dishes</h2>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDotLarge} />
              <span>Larger colony = more CVEs for that product</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDotFaded} />
              <span>Vivid color = unpatched &nbsp;·&nbsp; Faded = patched</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDotGlow} />
              <span>Pulsing glow = actively exploited in the wild</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendZone} />
              <span>Center = critical severity &nbsp;·&nbsp; Edges = low severity</span>
            </div>
          </div>
        </div>

        <div className={styles.statsBar}>
          <Stat label="Total CVEs" value={summary.totalCVEs.toLocaleString()} />
          <div className={styles.statDivider} />
          <Stat label="Critical" value={summary.critical} accent="critical" />
          <div className={styles.statDivider} />
          <Stat label="Actively exploited" value={summary.exploited} accent="exploited" />
          <div className={styles.statDivider} />
          <Stat label="Patch rate" value={`${summary.patchedPercent}%`} />
          <div className={styles.statDivider} />
          <Stat
            label="vs. last quarter"
            value={`${qoqSign}${summary.quarterOverQuarterChange}%`}
            accent={summary.quarterOverQuarterChange > 0 ? 'rising' : 'falling'}
          />
        </div>

        <div className={styles.scrollHint}>
          <span>Scroll to the lab bench</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>

      </div>
    </section>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue} data-accent={accent}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
