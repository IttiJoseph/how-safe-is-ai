import { useState } from 'react'
import categories from './config/categories.json'
import sampleData from './data/sample-cves.json'
import IntroSection from './components/IntroSection.jsx'
import LabBench from './components/LabBench.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [selectedDish, setSelectedDish] = useState(null)

  return (
    <>
      <IntroSection summary={sampleData.summary} />
      <LabBench
        categories={categories}
        cves={sampleData.cves}
        categoryStats={sampleData.categoryStats}
        selectedDish={selectedDish}
        onSelectDish={setSelectedDish}
      />
      <Footer />
    </>
  )
}
