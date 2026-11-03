'use client'

import { useState } from 'react'
import styles from './Analytics.module.css'

const label = (day, opts = { day: 'numeric', month: 'short' }) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-IN', opts)

/** A round axis top just above the biggest value: 1, 2, 5, 10, 20, 50, 100… */
function niceMax(n) {
  if (n <= 5) return 5
  const step = 10 ** Math.floor(Math.log10(n))
  return [1, 2, 5, 10].map((m) => m * step).find((v) => v >= n)
}

/** One column per day. Hover or keyboard focus shows that day; the table holds every value. */
export function DailyVisits({ data }) {
  const [active, setActive] = useState(null)
  const top = niceMax(Math.max(0, ...data.map((d) => d.visits)))
  const shown = active === null ? null : data[active]

  if (data.every((d) => d.views === 0)) {
    return <p className={styles.empty}>No visits recorded in this period yet.</p>
  }

  return (
    <>
      <div className={styles.chart} onMouseLeave={() => setActive(null)}>
        <div className={styles.axis} aria-hidden>
          {[top, top / 2, 0].map((t) => (
            <span key={t}>{t.toLocaleString('en-IN')}</span>
          ))}
        </div>
        <div className={styles.plot}>
          <div className={styles.gridLines} aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <div className={styles.columns}>
            {data.map((d, i) => (
              <div
                key={d.day}
                className={styles.column}
                tabIndex={0}
                role="img"
                aria-label={`${label(d.day)}: ${d.visits} visits, ${d.views} pages viewed`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                {d.visits > 0 && (
                  <span className={styles.columnFill} style={{ height: `${(d.visits / top) * 100}%` }} />
                )}
              </div>
            ))}
          </div>
          {shown && (
            <div
              className={styles.tooltip}
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
              data-flip={active > data.length * 0.7 || undefined}
            >
              <strong>{shown.visits.toLocaleString('en-IN')} visits</strong>
              <span>{shown.views.toLocaleString('en-IN')} pages viewed</span>
              <span>{label(shown.day, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden>
        <span>{label(data[0].day)}</span>
        <span>{label(data[Math.floor(data.length / 2)].day)}</span>
        <span>{label(data[data.length - 1].day)}</span>
      </div>
      <details className={styles.tableToggle}>
        <summary>View as table</summary>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Day</th>
              <th>Visits</th>
              <th>Pages viewed</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.day}>
                <td>{label(d.day, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                <td>{d.visits.toLocaleString('en-IN')}</td>
                <td>{d.views.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  )
}
