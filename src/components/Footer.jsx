import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.section}>
          <h3 className={styles.heading}>Methodology</h3>
          <p>
            CVEs are fetched nightly from the{' '}
            <a href="https://nvd.nist.gov/developers/vulnerabilities" target="_blank" rel="noreferrer">
              NVD API
            </a>{' '}
            and the{' '}
            <a href="https://github.com/advisories" target="_blank" rel="noreferrer">
              GitHub Advisory Database
            </a>
            . Entries are filtered by AI-term density, then categorised using priority-ordered
            keyword matching against category definitions in{' '}
            <code>src/config/categories.json</code>. Each CVE is assigned to exactly one
            category. CVEs with no matching keywords or product are excluded.
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.heading}>Data sources</h3>
          <ul>
            <li>
              <a href="https://nvd.nist.gov" target="_blank" rel="noreferrer">
                National Vulnerability Database (NVD)
              </a>{' '}
              — NIST, U.S. Dept. of Commerce
            </li>
            <li>
              <a href="https://github.com/advisories" target="_blank" rel="noreferrer">
                GitHub Advisory Database
              </a>{' '}
              — GitHub, Inc.
            </li>
          </ul>
        </div>

        <div className={styles.meta}>
          <span>Updated nightly via GitHub Actions</span>
          <span className={styles.dot}>·</span>
          <a
            href="https://github.com/IttiJoseph/how-safe-is-ai"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
          <span className={styles.dot}>·</span>
          <span>CVE data is public domain (NVD)</span>
        </div>
      </div>
    </footer>
  )
}
