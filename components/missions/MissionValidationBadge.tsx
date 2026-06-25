'use client'

import { useState } from 'react'
import type { ValidationIssue } from '@/lib/missions/validate'

type Props = {
  issues: ValidationIssue[]
}

export default function MissionValidationBadge({ issues }: Props) {
  const [open, setOpen] = useState(false)

  if (issues.length === 0) {
    return (
      <span className="validation-badge validation-badge-ok" title="Misioa egokia da">
        ✓ Egokia
      </span>
    )
  }

  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length

  return (
    <div className="validation-badge-wrapper">
      <button
        type="button"
        className={`validation-badge ${
          errors > 0
            ? 'validation-badge-error'
            : 'validation-badge-warning'
        }`}
        onClick={() => setOpen(!open)}
        title="Klik xehetasunetarako"
      >
        {errors > 0 ? '⚠' : '!'}{' '}
        {errors > 0 && `${errors} akats`}
        {errors > 0 && warnings > 0 && ' · '}
        {warnings > 0 && `${warnings} oharpen`}
      </button>

      {open && (
        <div className="validation-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="validation-dropdown-header">
            <h4>Misioaren arazoak</h4>
            <button
              type="button"
              className="validation-dropdown-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="validation-dropdown-list">
            {issues.map((issue, i) => (
              <li
                key={i}
                className={`validation-issue validation-issue-${issue.severity}`}
              >
                <span className="validation-issue-icon">
                  {issue.severity === 'error' ? '⚠' : 'ⓘ'}
                </span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
