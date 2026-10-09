# ISKCON Coimbatore – Sri Jagannath Mandir

Website and admin panel for ISKCON Coimbatore. Page structure follows the
"Page Structure – ISKCON Coimbatore Website" spec (14 pages).

**Stack:** Next.js 16 (App Router) · Payload CMS 3 (admin at `/admin`) · Tailwind CSS 4 ·
SQLite locally → Postgres in production · Razorpay (donations, to come) · Resend (email, to come)

## Getting started

```bash
cp .env.example .env      # then set PAYLOAD_SECRET to a long random string
npm install
npm run seed              # sample sevas, festivals, services, courses, timings
npm run dev               # http://localhost:3000
```

Open `/admin` and create the first staff user.

## Where things live

| What | Where |
| --- | --- |
| Colours, fonts, button styles | `src/app/(frontend)/globals.css` (`@theme`) |
| Menu | `src/lib/nav.ts` |
| Header / top bar / footer | `src/components/` |
| Home page (15 sections) | `src/app/(frontend)/page.tsx` |
| Content types | `src/collections/` (Sevas, Festivals, Services, Courses, Posts, Daily Darshan, Media) |
| Records from the public site | `src/collections/Submissions.ts` (Donations, Subscribers, Volunteers, Contact messages) |
| Site-wide settings | `src/globals/` (Home page, Temple timings, Site settings) |

Brand colours: royal purple `#4B1D7A`, saffron yellow `#F5B700`, white.

## Status

- [x] Theme, header (top bar with live temple status), footer, WhatsApp button
- [x] Home page and admin content model
- [ ] About, Services, Courses, Daily Darshan, Festivals, Blog, Volunteer, Contact, policy pages
- [ ] Donation form, Razorpay checkout + webhooks, thank-you page, 80G PDF receipts
- [ ] Nitya Seva (Razorpay subscriptions), YouTube strip, search, Excel export
- [ ] Switch to Postgres + cloud image storage before deploying
