# ISKCON Coimbatore — Mobile App API (v1)

JSON API for the ISKCON Coimbatore mobile app: every section of the website (texts and photos), the
contact / volunteer / subscribe forms, and online donations through the KCM payment gateway.

| | |
|---|---|
| **Base URL (production)** | `https://iskcon-coimbatore-yztu.vercel.app/api/app/v1` |
| **Base URL (local)** | `http://localhost:3000/api/app/v1` |
| **Format** | JSON in, JSON out (`Content-Type: application/json`) |
| **Postman** | Import `docs/postman/ISKCON-Coimbatore-App-API.postman_collection.json` |

---

## 1. Basics

### Authentication
None by default. If the server sets the `APP_API_KEY` environment variable, every request must send it:

```
x-api-key: <APP_API_KEY>
```

Without it the API answers `401 {"error":{"code":"unauthorised",...}}`.

> The payment gateway's secret is **never** needed in the app. The server talks to the gateway; the app only ever sees a `checkout` object or a `paymentUrl`.

### Photos and videos
Every photo or video field is either `null` or a **Photo** object. All URLs are absolute.

```json
{
  "url": "https://iskcon-coimbatore-yztu.vercel.app/api/media/file/srila-prabhupada.jpg",
  "alt": "His Divine Grace A.C. Bhaktivedanta Swami Srila Prabhupada",
  "width": 1200,
  "height": 1600,
  "mimeType": "image/jpeg",
  "sizes": {
    "thumb": "https://…/srila-prabhupada-400x533.jpg",
    "card":  "https://…/srila-prabhupada-800x1067.jpg",
    "hero":  "https://…/srila-prabhupada-1920x2560.jpg"
  }
}
```

- Use `sizes.thumb` (400 px wide) for lists, `sizes.card` (800 px) for cards, `sizes.hero` (1920 px) for full-screen. Any size may be `null` (for example, when the original is smaller); fall back to `url`.
- Videos have `mimeType` `video/mp4`, `video/quicktime` or `video/webm`, and `sizes` all `null`.

### Rich text
Long texts written in the admin's editor (festival significance, blog posts) come as HTML strings in fields ending in `Html`. Render them in a WebView or an HTML text component.

### Errors
Every error has the same shape:

```json
{ "error": { "code": "validation_failed", "message": "Please enter a valid email.", "field": "email" } }
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `invalid_json` | Body is missing or not JSON |
| 401 | `unauthorised` | `x-api-key` missing or wrong (only when the server requires it) |
| 404 | `not_found` / `seva_unavailable` | Unknown slug or reference, or the seva is closed |
| 422 | `validation_failed` | A field is wrong; `field` names it, `message` is ready to show the user |
| 500 | `server_error` | Unexpected; safe to retry |

`message` texts are written for donors and can be shown as-is.

### Caching
GET responses may be cached for up to 60 seconds. Content changed in the admin appears within about a minute.

---

## 2. Content endpoints (GET)

| Endpoint | Screen |
|---|---|
| `GET /home` | Home screen: every home section in one call |
| `GET /settings` | Contact details, social links, 80G / UPI / bank details |
| `GET /timings` | Open / closed status and the daily schedule |
| `GET /live` | Is the temple's YouTube channel streaming right now? |
| `GET /photos` | Explore tiles, page banner photos, Kovai Chandra photos |
| `GET /sevas` | Seva (donation) list |
| `GET /sevas/{slug}` | One seva |
| `GET /festivals` | Festival calendar |
| `GET /festivals/{slug}` | One festival with schedule, significance and gallery |
| `GET /services` | Devotional services |
| `GET /courses` | Courses and classes |
| `GET /posts` | Blog list (paged) |
| `GET /posts/{slug}` | One blog post |
| `GET /daily-darshan` | Daily darshan photos (newest first, paged) |
| `GET /art-gallery` | All artworks |

### `GET /home`

One call for the whole home screen. Sections that have no content are empty arrays or `null`.

```json
{
  "heroSlides": [
    {
      "layout": "cinematic",            // "arch" (portrait photo) | "cinematic" (full-bleed)
      "tone": "purple",                 // purple | maroon | indigo | green | saffron | ivory
      "eyebrow": "Hare Krishna · Welcome home",
      "heading": "Abode of Sri Sri Jagannath, Baladeva & Subhadra",
      "text": "Come for darshan, stay for kirtan and prasadam.",
      "verse": null,
      "image": Photo,
      "video": Photo | null,            // MP4/MOV background video
      "videoWebm": Photo | null,
      "buttonLabel": "Today's Darshan",
      "link": "/daily-darshan"          // website path; map to an app screen
    }
  ],
  "timings": Timings,                   // same as GET /timings
  "highlightSevas": [Seva],             // 3 featured sevas
  "donationSevas": [Seva],              // up to 4 donation cards
  "about": {
    "image": Photo, "smallImage": Photo, "cardImage": Photo,
    "cardTitle": "Sri Jagannath", "cardSubtitle": "Lord of the Universe", "text": "…"
  },
  "founder": { "image": Photo },
  "explore": { "deities": Photo, "kirtan": Photo, "prasadam": Photo, "goshala": Photo, "kovaiChandra": Photo, "visit": Photo },
  "visitImage": Photo,
  "livePuja": {                         // null when no live link is set in the admin
    "title": "Live online puja", "text": "…", "time": "Every day · 7:00 PM IST",
    "schedule": "Daily 4:15 AM Mangala Arati · 7:00 PM Sandhya Arati",
    "platform": "YouTube · Free to join", "link": "https://www.youtube.com/…", "image": Photo
  },
  "upcomingFestivals": [Festival],      // next 4
  "featuredCourses": [Course],
  "featuredServices": [Service],
  "latestPosts": [Post],                // latest 3, without content
  "artGallery": [Artwork],              // first 8
  "instagramReels": [
    { "id": "…", "poster": "https://…jpg", "video": { "url": "https://…mp4", "type": "video/mp4" } | null,
      "caption": "Evening kirtan", "alt": "…", "link": "https://instagram.com/…" | null }
  ],
  "youtubeVideos": [ { "title": "…", "url": "https://youtube.com/…", "date": "2026-10-01T00:00:00.000Z" | null } ],
  "settings": Settings                  // same as GET /settings
}
```

### `GET /settings`

```json
{
  "address": "Sri Jagannath Mandir, Hare Krishna Road,\nCivil Aerodrome (PO), Coimbatore – 641014",
  "phone": "+91 90422 16108",
  "whatsapp": "919042216108",           // digits with country code → https://wa.me/<whatsapp>
  "email": "iskcon.coimbatore@gmail.com",
  "mapUrl": "https://maps.google.com/…" | null,
  "social": { "facebook": "…", "instagram": "…", "youtube": "…", "whatsappChannel": "…" },
  "donations": {
    "reg80G": "…" | null, "reg80GValidity": "…" | null,
    "upiId": "…" | null, "upiQr": Photo | null, "bankDetails": "…" | null
  }
}
```

### `GET /timings` → **Timings**

```json
{
  "status": { "open": true, "label": "Temple Open · closes 1:00 PM" },   // India time, computed on the server
  "openSessions": [ { "opens": "04:15", "closes": "13:00" }, { "opens": "16:00", "closes": "20:15" } ],
  "schedule": [ { "time": "4:15 AM", "activity": "Mangala Arati" } ]
}
```

### `GET /live`

Checks the temple's YouTube channel ([@ISKCON_Coimbatore](https://www.youtube.com/@ISKCON_Coimbatore/streams)) at most once a minute. Never needs `x-api-key`.

```json
{
  "live": true,                         // true only while actually streaming
  "videoId": "wwRU-m8hAvI",             // current stream, or the next scheduled one when not live
  "upcoming": false,                    // true when a stream is scheduled but has not started
  "title": "ISKCON Coimbatore is live",
  "embedUrl": "https://www.youtube-nocookie.com/embed/wwRU-m8hAvI?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1",
  "watchUrl": "https://www.youtube.com/watch?v=wwRU-m8hAvI",
  "checkedAt": "2026-11-01T12:35:49.592Z"
}
```
When `live` is `false`, `embedUrl` is `null` and `watchUrl` points to the channel's streams page. Show the stream with `embedUrl` in a WebView, or open `watchUrl` in the YouTube app.

### `GET /photos`

```json
{
  "explore":     { "deities": Photo, "kirtan": Photo, "prasadam": Photo, "goshala": Photo, "kovaiChandra": Photo, "visit": Photo },
  "pageBanners": { "services": Photo, "courses": Photo, "festivals": Photo, "donate": Photo, "volunteer": Photo,
                   "dailyDarshan": Photo, "artGallery": Photo, "blog": Photo, "contact": Photo },
  "kovaiChandra": { "banner": Photo, "photos": [Photo] }
}
```
Every slot is listed; empty slots are `null`.

### `GET /sevas` → `{ "docs": [Seva] }`

| Query | Values | Default |
|---|---|---|
| `category` | `regular`, `festival` | both |
| `monthly` | `true` → only sevas offered as monthly Nitya Seva | all |
| `includeClosed` | `true` → also festival sevas outside their dates | open only |

**Seva**
```json
{
  "slug": "annadaan",
  "title": "Annadaan Seva",
  "category": "regular",                // regular | festival
  "shortDescription": "Feed devotees and visitors with sanctified Krishna prasadam.",
  "image": Photo, "cardImage": Photo,
  "presetAmounts": [1500, 3000],        // quick-pick amounts in ₹
  "items": [ { "label": "Annadaan – 25 plates", "price": 1000 } ],
  "allowMonthly": true,
  "startDate": null, "endDate": null,   // festival sevas only
  "isOpen": true,
  "onlinePayment": true                 // false → donation is recorded, donor pays by UPI / bank transfer
}
```

`GET /sevas/{slug}` returns one **Seva**, or `404`.

### `GET /festivals` → `{ "docs": [Festival] }`

| Query | Values | Default |
|---|---|---|
| `when` | `upcoming` (date ≥ today, soonest first), `past` (newest first), `all` | `upcoming` |
| `limit` | 1–100 | 50 |

**Festival**
```json
{
  "slug": "govardhan-puja", "name": "Govardhan Puja",
  "date": "2026-11-20T00:00:00.000Z", "timeLabel": "5:30 AM onwards",
  "shortDescription": "…", "image": Photo,
  "seva": { "slug": "annadaan", "title": "Annadaan Seva" } | null    // the "Support" button → donation for this seva
}
```

`GET /festivals/{slug}` adds:
```json
{ "significanceHtml": "<p>…</p>" | null,
  "schedule": [ { "time": "5:30 AM", "activity": "Mangala Arati" } ],
  "gallery": [Photo] }
```

### `GET /services` → `{ "docs": [Service] }`
```json
{
  "id": 1, "title": "Speak to a Priest", "description": "…", "image": Photo,
  "action": "whatsapp",                 // donate → open seva  | whatsapp → wa.me chat | enquiry → contact form | link → open url
  "seva": { "slug": "annadaan", "title": "…" } | null,
  "url": "https://…" | null, "buttonLabel": "…" | null, "featured": true
}
```

### `GET /courses` → `{ "docs": [Course] }`
```json
{ "id": 1, "title": "Learn to Chant", "description": "…", "image": Photo,
  "schedule": "Every Saturday, 6:00 PM", "mode": "online", "zoomLink": "https://zoom.us/…" | null, "featured": true }
```
`mode`: `online` | `temple` | `both`.

### `GET /posts` → paged list
| Query | Values | Default |
|---|---|---|
| `page` | 1… | 1 |
| `limit` | 1–50 | 10 |
| `category` | `Festivals`, `Philosophy`, `Temple News`, `Tamil` | all |

```json
{ "docs": [ { "slug": "…", "title": "…", "category": "Festivals", "publishedAt": "…", "author": "…" | null,
              "image": Photo, "excerpt": "…" } ],
  "page": 1, "totalPages": 3, "totalDocs": 27 }
```
`GET /posts/{slug}` returns one post with `contentHtml`.

### `GET /daily-darshan` → paged, newest day first
Query `page` (default 1), `limit` (days per page, 1–31, default 7).
```json
{ "docs": [ { "date": "2026-10-31T00:00:00.000Z", "photos": [Photo] } ], "page": 1, "totalPages": 4 }
```

### `GET /art-gallery` → `{ "docs": [Artwork] }`
```json
{ "id": 12, "url": "https://…jpg", "width": 1600, "height": 1200, "alt": "…", "title": "Govardhan-dhari", "kind": "Painting" }
```

---

## 3. Form endpoints (POST)

All return `201` with `{ "ok": true, "message": "<text to show the user>" }`, or a `422` error naming the field.

### `POST /contact` → Admin → Contact messages
| Field | Type | Required | Rules |
|---|---|---|---|
| `firstName` | string | ✓ | |
| `lastName` | string | ✓ | |
| `email` | string | ✓ | valid email |
| `phone` | string | ✓ | 10–15 digits, may include `+`, spaces, `-` |
| `message` | string | ✓ | |
| `category` | string | | `General` (default), `Donation / 80G receipt`, `Seva`, `Volunteer`, `Suggestion`, `Other` |
| `consent` | boolean | | agreed to WhatsApp/SMS updates |

```json
{ "firstName": "Radha", "lastName": "Devi", "email": "radha@example.com", "phone": "9876543210",
  "category": "Seva", "message": "How can I sponsor Annadaan on my birthday?", "consent": true }
```

### `POST /volunteers` → Admin → Volunteers
| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✓ | |
| `mobile` | string | ✓ | 10–15 digits |
| `email` | string | | valid email if given |
| `area` | string | | where they live |
| `interest` | string or string[] | | e.g. `["Festivals","Goshala","Prasadam"]` |
| `availability` | string | | e.g. `"Weekends"` |
| `skills` | string | | |

### `POST /subscribe` → Admin → Subscribers
| Field | Type | Required |
|---|---|---|
| `name` | string | ✓ |
| `email` | string | ✓ (valid email; subscribing twice is fine) |
| `phone` | string | |
| `consent` | boolean | |

---

## 4. Donations (online payment)

Payments go through the **KCM Payment Gateway** of ISKCON Coimbatore (Razorpay). The gateway issues the
receipt and sends it to the donor on WhatsApp/email.

### Flow

```
App                                   This API                          KCM gateway / Razorpay
 │ 1. POST /donations ───────────────▶ saves donation, finds donor ───▶ contacts/resolve
 │                                     creates checkout session ──────▶ checkout/sessions
 │ ◀── reference, paymentUrl, checkout
 │ 2. open paymentUrl in a browser view ──────────────────────────────▶ Razorpay payment page
 │                                                                       │ donor pays
 │ 3. browser lands on  …/donate/thank-you?ref=SEVA-…  ◀────────────────┘ (gateway redirects)
 │    → close the browser view
 │ 4. GET /donations/{reference} ────▶ asks gateway for the real status
 │ ◀── status: "paid" + receiptNo
```

### Step 1 — `POST /donations`

| Field | Type | Required | Rules |
|---|---|---|---|
| `seva` | string | ✓ | seva `slug` from `GET /sevas` |
| `amount` | number | ✓ | rupees, whole number ≥ 1 |
| `fullName` | string | ✓ | at least 3 characters; printed on the receipt |
| `mobile` | string | ✓ | Indian mobile, 10–15 characters (`9876543210`, `+91 98765 43210`) |
| `email` | string | ✓ | valid email |
| `item` | string | | exact `label` of one of the seva's `items` (e.g. `"Annadaan – 25 plates"`); then the gateway's catalog price for that item is charged |
| `frequency` | string | | `one-time` (default) or `monthly` — monthly charges the **first month now**; the temple follows up for later months |
| `occasion` | string | | e.g. `"Birthday"` |
| `pan` | string | | for 80G receipt, format `ABCDE1234F` |
| `address` | string | | for 80G receipt |
| `pin` | string | | PIN code |
| `consent` | boolean | | receipts and updates on WhatsApp/email |

Example:
```json
{
  "seva": "annadaan",
  "amount": 1500,
  "fullName": "Prabhupada Dasa",
  "mobile": "9876543210",
  "email": "prabhupada.dasa@example.com",
  "frequency": "one-time",
  "occasion": "Birthday",
  "pan": "ABCDE1234F",
  "address": "12, Anna Nagar, Coimbatore",
  "pin": "641001",
  "consent": true
}
```

Response `201`, **online payment available**:
```json
{
  "reference": "SEVA-3B34CEA9E2",
  "amount": 1500,                      // ₹ actually charged (from the gateway)
  "frequency": "one-time",
  "name": "Prabhupada Dasa",
  "onlinePayment": true,
  "paymentUrl": "https://iskcon-coimbatore-yztu.vercel.app/donate/pay?ref=SEVA-3B34CEA9E2",
  "checkout": {                         // only for apps using Razorpay checkout themselves; pass unchanged
    "key_id": "rzp_live_…", "amount": 150000, "currency": "INR", "order_id": "order_…",
    "name": "ISKCON Coimbatore", "description": "Donation", "image": "https://…",
    "prefill": { "name": "Prabhupada Dasa", "contact": "9876543210", "email": "…" },
    "callback_url": "https://iskconcoimbatore.com/api/razorpay-verify", "redirect": true
  },
  "sessionId": "kpg_…",
  "returnUrlPrefix": "https://iskcon-coimbatore-yztu.vercel.app/donate/thank-you",
  "offlineReason": null,
  "offlinePayment": null
}
```

Response `201`, **online payment not available** (the donation is still recorded; show the UPI / bank details):
```json
{
  "reference": "SEVA-9E53B59678",
  "amount": 1000,
  "onlinePayment": false,
  "paymentUrl": null,
  "checkout": null,
  "sessionId": null,
  "offlineReason": "seva_has_no_scheme_id",   // or gateway_not_configured | gateway_unavailable
  "offlinePayment": { "reg80G": "…", "reg80GValidity": "…", "upiId": "iskcon@upi", "upiQr": Photo, "bankDetails": "…" }
}
```
For UPI, build: `upi://pay?pa=<upiId>&pn=ISKCON%20Coimbatore&am=<amount>&cu=INR&tn=<reference>`.

### Step 2 — Pay

Open `paymentUrl` in an **in-app browser** (Android Custom Tabs / iOS `SFSafariViewController`) or a WebView. It opens Razorpay straight away. Do **not** change anything in the payment page or the `checkout` object.

### Step 3 — Return

After payment the browser goes to a URL starting with `returnUrlPrefix`
(`…/donate/thank-you?ref=SEVA-…`). The page itself shows the result, so it is fine to leave it open; or, in a WebView, watch for this URL, close the view and continue with step 4.

### Step 4 — `GET /donations/{reference}`

The **only** source of truth. Return-URL parameters are hints, not proof of payment.

```json
{
  "reference": "SEVA-3B34CEA9E2",
  "status": "paid",                     // created | paid | failed | expired | refunded
  "amount": 1500,
  "seva": "Annadaan Seva",
  "name": "Prabhupada Dasa",
  "receiptNo": "12345",
  "paymentId": "pay_…",
  "paidAt": "2026-10-31T10:05:12.000Z",
  "failureReason": null,
  "onlinePayment": true
}
```

| `status` | Meaning | App should |
|---|---|---|
| `created` | Not paid yet, or still being confirmed | Poll every 3–5 s for up to 2 min, then show "We'll confirm shortly" |
| `paid` | Paid and receipt issued (`receiptNo` set) | Show success with `receiptNo` |
| `failed` | Payment failed | Show `failureReason`; offer to start again (new `POST /donations`) |
| `expired` | Not paid in time | Start again with a new `POST /donations` |
| `refunded` | Refunded by the temple | Show as refunded |

A donation counts as successful **only** when `status` is `"paid"` **and** `receiptNo` is not null.

### Testing donations in Postman

- Run **Donations → Start donation**; the collection saves `reference` and `paymentUrl`.
- Open `paymentUrl` in a browser to pay; then run **Donation status**.
- **The production gateway takes real money.** Use a seva with a small amount, or ask ISKCON IT (itsupport@iskconcoimbatore.com) for a staging gateway and secret.
- To test without paying: use a seva whose `onlinePayment` is `false` → the response has `onlinePayment: false` and nothing is charged.

---

## 5. For the temple team (admin setup)

| Where | What |
|---|---|
| Admin → **Sevas** → a seva → **Gateway scheme ID** (right sidebar) | The open-amount scheme ID from ISKCON IT's gateway catalog, e.g. `1-51`. Without it, that seva shows UPI / bank details instead of online payment. |
| Admin → **Sevas** → a seva → **Items** → **Gateway scheme ID** | Optional fixed-price scheme for that item; the gateway charges its own catalog price. |
| Admin → **Donations** | Every donation with its reference, status, receipt number, Razorpay ids and whether it came from the website or the app. |
| Vercel → Environment Variables | `KCM_PAYMENT_GATEWAY_SECRET` (required for online payment), `SITE_URL` (optional; defaults to the Vercel production address), `KCM_PAYMENT_GATEWAY_URL` (optional; defaults to production gateway), `APP_API_KEY` (optional; requires `x-api-key` on the app API). |
| ISKCON IT | Must allowlist the return URL `https://iskcon-coimbatore-yztu.vercel.app/donate/thank-you` (any `?ref=…` query). |
