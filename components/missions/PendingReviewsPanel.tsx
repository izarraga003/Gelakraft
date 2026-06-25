'use client'

import { useState } from 'react'
import { reviewSubmission, type PendingReview } from '@/lib/missions/extra-actions'
import AsyncButton from '@/components/ui/AsyncButton'

type Props = {
  initialReviews: PendingReview[]
}

export default function PendingReviewsPanel({ initialReviews }: Props) {
  const [reviews, setReviews] = useState<PendingReview[]>(initialReviews)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (reviews.length === 0) return null

  async function handleReview(
    review: PendingReview,
    outcome: 'success' | 'failure'
  ) {
    const result = await reviewSubmission(review.node_id, review.student_id, outcome)
    if (!result.success) {
      alert(`Errorea: ${result.error}`)
      return
    }
    setReviews((prev) => prev.filter((r) => r.progress_id !== review.progress_id))
  }

  return (
    <section className="panel-section reviews-panel">
      <div className="panel-section-header">
        <h2 className="panel-section-title">
          ⏳ Berrikuspen zain ({reviews.length})
        </h2>
      </div>
      <p className="reviews-panel-hint">
        Ikasleek bidalitako entregak berretsi edo huts egiten direla markatu
        behar dituzu. Sariak eta zigorrak automatikoki aplikatuko dira.
      </p>

      <div className="reviews-list">
        {reviews.map((r) => {
          const isOpen = expanded === r.progress_id
          return (
            <article key={r.progress_id} className="review-card">
              <button
                type="button"
                className="review-card-header"
                onClick={() => setExpanded(isOpen ? null : r.progress_id)}
              >
                <div>
                  <div className="review-card-student">{r.student_name}</div>
                  <div className="review-card-meta">
                    <strong>{r.mission_name}</strong> · {r.node_title}
                  </div>
                </div>
                <div className="review-card-date">
                  {timeAgo(r.submitted_at)}
                </div>
                <span className="review-card-chevron">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {isOpen && (
                <div className="review-card-body">
                  <div className="review-card-submission-label">
                    Ikaslearen entrega:
                  </div>
                  <div className="review-card-submission">
                    {r.submission_text?.trim() || (
                      <span className="review-card-empty">
                        (Iruzkinik gabe bidalia)
                      </span>
                    )}
                  </div>
                  <div className="review-card-actions">
                    <AsyncButton
                      className="review-card-btn-failure"
                      onClick={() => handleReview(r, 'failure')}
                    >
                      ✗ Hutsegitea
                    </AsyncButton>
                    <AsyncButton
                      className="review-card-btn-success"
                      onClick={() => handleReview(r, 'success')}
                    >
                      ✓ Onartu
                    </AsyncButton>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function timeAgo(iso: string): string {
  const date = new Date(iso)
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 60) return 'orain'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ord`
  const d = Math.floor(h / 24)
  return `${d} egun`
}
