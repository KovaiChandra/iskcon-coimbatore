const DAY = 86_400_000

const india = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date)

/** The last `days` calendar days in India, oldest first. */
const lastDays = (days, endingAt = new Date()) =>
  Array.from({ length: days }, (_, i) => india(new Date(endingAt.getTime() - (days - 1 - i) * DAY)))

/** { key: count } → [{ label, value }], biggest first, with the rest folded into "Other". */
function ranked(counts, top) {
  const rows = Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
  if (rows.length <= top) return rows
  const other = rows.slice(top).reduce((sum, r) => sum + r.value, 0)
  return [...rows.slice(0, top), { label: 'Other', value: other }]
}

const bump = (counts, key, by = 1) => {
  if (key) counts[key] = (counts[key] ?? 0) + by
}

/** Everything the Analytics page shows, for the last `days` days plus the period before, to compare. */
export async function getAnalyticsReport(payload, days) {
  const now = new Date()
  const period = lastDays(days, now)
  const previous = lastDays(days, new Date(now.getTime() - days * DAY))
  const inPeriod = new Set(period)
  const since = new Date(now.getTime() - 2 * days * DAY).toISOString()

  const [views, donations, enquiries, messages, volunteers, subscribers] = await Promise.all([
    payload.find({
      collection: 'page-views',
      where: { day: { greater_than_equal: previous[0] } },
      pagination: false,
      limit: 0,
      depth: 0,
      select: { day: true, path: true, visitor: true, device: true, source: true, city: true },
    }),
    payload.find({
      collection: 'donations',
      where: { createdAt: { greater_than_equal: since } },
      pagination: false,
      limit: 0,
      depth: 1,
      select: { status: true, amount: true, seva: true, source: true, createdAt: true },
    }),
    ...['enquiries', 'contact-messages', 'volunteers', 'subscribers'].map((collection) =>
      payload.count({
        collection,
        where: { createdAt: { greater_than_equal: new Date(now.getTime() - days * DAY).toISOString() } },
      }),
    ),
  ])

  // ---- Visits: a visitor counts once per day
  const daily = Object.fromEntries(period.map((d) => [d, { day: d, visitors: new Set(), views: 0 }]))
  const previousVisits = new Set()
  const donateVisitors = new Set()
  const pages = {}
  const sources = {}
  const cities = {}
  const devices = {}
  const seenSource = new Set()
  let previousViews = 0
  for (const v of views.docs) {
    const visit = `${v.day}|${v.visitor}`
    if (!inPeriod.has(v.day)) {
      previousVisits.add(visit)
      previousViews += 1
      continue
    }
    daily[v.day].visitors.add(v.visitor)
    daily[v.day].views += 1
    bump(pages, v.path)
    if (v.path.startsWith('/donate')) donateVisitors.add(visit)
    // Where a visit came from, its city and device are counted once per visit
    if (!seenSource.has(visit)) {
      seenSource.add(visit)
      bump(sources, v.source || 'Direct')
      bump(cities, v.city)
      bump(devices, v.device)
    }
  }
  const days_ = period.map((d) => ({
    day: d,
    visits: daily[d].visitors.size,
    views: daily[d].views,
  }))
  const visits = days_.reduce((sum, d) => sum + d.visits, 0)
  const pageViews = days_.reduce((sum, d) => sum + d.views, 0)

  // ---- Donations
  const cutoff = new Date(`${period[0]}T00:00:00+05:30`).getTime()
  const current = donations.docs.filter((d) => new Date(d.createdAt).getTime() >= cutoff)
  const before = donations.docs.filter((d) => new Date(d.createdAt).getTime() < cutoff)
  const paid = current.filter((d) => d.status === 'paid')
  const paidBefore = before.filter((d) => d.status === 'paid')
  const sum = (rows) => rows.reduce((total, d) => total + (d.amount ?? 0), 0)
  const bySeva = {}
  for (const d of paid) bump(bySeva, typeof d.seva === 'object' ? d.seva?.title : 'Seva', d.amount ?? 0)

  return {
    days,
    daily: days_,
    totals: {
      visits,
      pageViews,
      started: current.length,
      paid: paid.length,
      amount: sum(paid),
      enquiries: enquiries.totalDocs,
      messages: messages.totalDocs,
      volunteers: volunteers.totalDocs,
      subscribers: subscribers.totalDocs,
    },
    previous: {
      visits: previousVisits.size,
      pageViews: previousViews,
      started: before.length,
      paid: paidBefore.length,
      amount: sum(paidBefore),
    },
    funnel: [
      { label: 'Visits to the website', value: visits },
      { label: 'Visited a donation page', value: donateVisitors.size },
      { label: 'Started a donation', value: current.length },
      { label: 'Paid', value: paid.length },
    ],
    pages: ranked(pages, 8),
    sources: ranked(sources, 6),
    cities: ranked(cities, 6),
    devices: ranked(devices, 2),
    bySeva: ranked(bySeva, 6),
  }
}
