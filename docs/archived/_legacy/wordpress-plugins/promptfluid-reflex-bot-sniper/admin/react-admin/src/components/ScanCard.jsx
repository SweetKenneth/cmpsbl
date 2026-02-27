import React from 'react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export function ScanCard({ issue }) {
  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: XCircle,
        className: 'clarity-issue-critical',
        color: '#ef4444'
      },
      warning: {
        icon: AlertTriangle,
        className: 'clarity-issue-warning',
        color: '#f59e0b'
      },
      info: {
        icon: CheckCircle,
        className: 'clarity-issue-info',
        color: '#3b82f6'
      }
    }
    return configs[severity] || configs.info
  }

  const config = getSeverityConfig(issue.severity)
  const Icon = config.icon

  return (
    <div className={`clarity-issue ${config.className}`}>
      <div className="clarity-issue-title">
        <Icon size={16} style={{ display: 'inline', marginRight: '8px', color: config.color }} />
        {issue.description}
      </div>
      {issue.wcag && (
        <div className="clarity-issue-wcag">WCAG {issue.wcag}</div>
      )}
      {issue.element_selector && (
        <div className="clarity-issue-description">
          <strong>Element:</strong> <code>{issue.element_selector}</code>
        </div>
      )}
      {issue.fix && (
        <div className="clarity-issue-description">
          <strong>Suggested Fix:</strong> {issue.fix}
        </div>
      )}
    </div>
  )
}
