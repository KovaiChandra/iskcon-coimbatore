import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAnalyticsReport } from '../../lib/analytics-report'
import { inr } from '../../lib/format'
import { DailyVisits } from './DailyVisits'
import styles from './Analytics.module.css'

const RANGES = [7, 30, 90]
const count = (n) => n.toLocaleString('en-IN')

/** "+12% vs previous 30 days", or nothing when there is no earlier period to compare with. */
function change(now, before, days) {
  if (!before) return null
  const pct = Math.round(((now - before) / before) * 100)
  return `${pct > 0 ? '+' : ''}${pct}% vs previous ${days} days`
}

function Tile({ label, value, note }) {
  return (
    <div className={styles.tile}>
      <p className={styles.tileLabel}>{label}</p>
      <p className={styles.tileValue}>{value}</p>
      {note && <p className={styles.tileNote}>{note}</p>}
    </div>
  )
}

/** Labelled horizontal bars; each value is written beside its bar. */
function Bars({ title, hint, rows, format = count, empty = 'Nothing yet.' }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {hint && <p className={styles.hint}>{hint}</p>}
      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.bars}>
          {rows.map((r) => (
            <li key={r.label}>
              <div className={styles.barHead}>
                <span className={styles.barLabel}>{r.label}</span>
                <span className={styles.barValue}>{format(r.value)}</span>
              </div>
              <div className={styles.barTrack}>
                {r.value > 0 && (
                  <span className={styles.barFill} style={{ width: `${(r.value / max) * 100}%` }} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Admin → Analytics (/admin/analytics): visitors and donations at a glance. Staff only. */
export async function AnalyticsView({ initPageResult, params, searchParams }) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  if (!req.user) redirect('/admin/login')

  const asked = Number(searchParams?.range)
  const days = RANGES.includes(asked) ? asked : 30
  const report = await getAnalyticsReport(req.payload, days)
  const { totals, previous } = report

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Analytics</h1>
          <nav className={styles.ranges} aria-label="Time range">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/analytics?range=${r}`}
                aria-current={r === days ? 'true' : undefined}
                className={`${styles.range} ${r === days ? styles.rangeOn : ''}`}
              >
                {r} days
              </Link>
            ))}
          </nav>
        </header>

        <div className={styles.tiles}>
          <Tile
            label="Visits"
            value={count(totals.visits)}
            note={change(totals.visits, previous.visits, days)}
          />
          <Tile
            label="Pages viewed"
            value={count(totals.pageViews)}
            note={change(totals.pageViews, previous.pageViews, days)}
          />
          <Tile
            label="Donations paid"
            value={count(totals.paid)}
            note={change(totals.paid, previous.paid, days)}
          />
          <Tile
            label="Amount received"
            value={inr(totals.amount)}
            note={change(totals.amount, previous.amount, days)}
          />
          <Tile label="Enquiries" value={count(totals.enquiries)} note="Courses and priest requests" />
          <Tile label="Contact messages" value={count(totals.messages)} />
          <Tile label="New volunteers" value={count(totals.volunteers)} />
          <Tile label="New subscribers" value={count(totals.subscribers)} />
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Visits per day</h2>
          <DailyVisits data={report.daily} />
        </section>

        <div className={styles.grid}>
          <Bars
            title="From visit to donation"
            hint="How many visits go on to give, in this period."
            rows={report.funnel}
          />
          <Bars title="Donations by seva" rows={report.bySeva} format={inr} empty="No paid donations yet." />
          <Bars title="Most viewed pages" rows={report.pages} />
          <Bars title="Where visitors come from" rows={report.sources} />
          <Bars title="Cities" rows={report.cities} empty="City appears on the live site only." />
          <Bars title="Devices" rows={report.devices} />
        </div>

        <p className={styles.footnote}>
          Anonymous: no cookies, and IP addresses are never stored. A visitor counts once per day.
          Search-engine bots and logged-in staff are not counted. Donations count as paid once the
          payment gateway confirms them, or when staff mark them paid under Donations.
        </p>
      </Gutter>
    </DefaultTemplate>
  )
}
