import React from 'react'

export function StatsGrid({ scanData }) {
  const getScoreClass = (score) => {
    if (score >= 90) return 'clarity-score-good'
    if (score >= 70) return 'clarity-score-warning'
    return 'clarity-score-error'
  }

  const stats = [
    {
      label: 'Compliance Score',
      value: scanData?.compliance_score ? (
        <span className={`clarity-score ${getScoreClass(scanData.compliance_score)}`}>
          {Math.round(scanData.compliance_score)}%
        </span>
      ) : 'N/A'
    },
    {
      label: 'Total Issues',
      value: scanData?.total_issues || 0
    },
    {
      label: 'Critical',
      value: scanData?.critical_issues || 0,
      valueStyle: { color: '#ef4444' }
    },
    {
      label: 'Pages Scanned',
      value: scanData?.pages_scanned || 0
    }
  ]

  return (
    <div className="clarity-stats">
      {stats.map((stat, index) => (
        <div key={index} className="clarity-stat">
          <div className="clarity-stat-label">{stat.label}</div>
          <div className="clarity-stat-value" style={stat.valueStyle}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}
