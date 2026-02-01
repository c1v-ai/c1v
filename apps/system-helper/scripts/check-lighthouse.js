const fs = require('fs')

// Check if report file exists
if (!fs.existsSync('./lighthouse-report.json')) {
  console.error('Error: lighthouse-report.json not found')
  console.error('Run: npm run test:lighthouse')
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync('./lighthouse-report.json', 'utf8'))

const scores = {
  performance: Math.round(report.categories.performance.score * 100),
  accessibility: Math.round(report.categories.accessibility.score * 100),
  'best-practices': Math.round(report.categories['best-practices'].score * 100),
  seo: Math.round(report.categories.seo.score * 100),
  pwa: report.categories.pwa ? Math.round(report.categories.pwa.score * 100) : 'N/A',
}

console.log('\n========================================')
console.log('         LIGHTHOUSE SCORES')
console.log('========================================\n')

console.table(scores)

// Define thresholds
const thresholds = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 80,
}

// Check thresholds
const failures = []
const warnings = []

Object.entries(thresholds).forEach(([category, threshold]) => {
  const score = scores[category]
  if (typeof score === 'number') {
    if (score < threshold) {
      failures.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score,
        threshold,
        diff: threshold - score,
      })
    } else if (score < threshold + 5) {
      warnings.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score,
        threshold,
      })
    }
  }
})

// Report results
if (failures.length > 0) {
  console.log('\n----------------------------------------')
  console.log('           FAILED THRESHOLDS')
  console.log('----------------------------------------')
  failures.forEach((f) => {
    console.log(`  ${f.category}: ${f.score}% (required: ${f.threshold}%, diff: -${f.diff}%)`)
  })
  console.log('')
}

if (warnings.length > 0) {
  console.log('\n----------------------------------------')
  console.log('             WARNINGS')
  console.log('----------------------------------------')
  warnings.forEach((w) => {
    console.log(`  ${w.category}: ${w.score}% (threshold: ${w.threshold}%, close to limit)`)
  })
  console.log('')
}

// Print detailed issues for failed categories
if (failures.length > 0) {
  console.log('\n----------------------------------------')
  console.log('         IMPROVEMENT SUGGESTIONS')
  console.log('----------------------------------------\n')

  failures.forEach((f) => {
    const categoryKey = f.category.toLowerCase().replace('-', '')
    const audits = report.categories[
      f.category === 'Best-practices' ? 'best-practices' : f.category.toLowerCase()
    ]?.auditRefs

    if (audits) {
      const failedAudits = audits
        .filter((ref) => {
          const audit = report.audits[ref.id]
          return audit && audit.score !== null && audit.score < 1
        })
        .slice(0, 5)

      if (failedAudits.length > 0) {
        console.log(`${f.category}:`)
        failedAudits.forEach((ref) => {
          const audit = report.audits[ref.id]
          console.log(`  - ${audit.title}`)
        })
        console.log('')
      }
    }
  })
}

// Summary
console.log('========================================')
if (failures.length === 0) {
  console.log('  All thresholds PASSED!')
  console.log('========================================\n')
  process.exit(0)
} else {
  console.log(`  ${failures.length} threshold(s) FAILED`)
  console.log('========================================\n')
  process.exit(1)
}
