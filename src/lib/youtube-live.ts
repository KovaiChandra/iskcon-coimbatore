/**
 * Is the temple's YouTube channel streaming right now? Reads the channel's public /live page
 * (no API key needed) and returns the live video, if any. Cached for a minute.
 * Channel: https://www.youtube.com/@ISKCON_Coimbatore (id below; change it here if the channel changes).
 */
export const YOUTUBE_CHANNEL_ID = 'UCar6G_aXHfnbjPyhBfP0_eg'
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@ISKCON_Coimbatore/streams'

export type LiveStatus = {
  live: boolean
  /** The current (or next scheduled) stream's video id */
  videoId: string | null
  upcoming: boolean
  title: string | null
  embedUrl: string | null
  watchUrl: string
  checkedAt: string
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

export async function getLiveStatus(channelId = YOUTUBE_CHANNEL_ID): Promise<LiveStatus> {
  const checkedAt = new Date().toISOString()
  const offline: LiveStatus = {
    live: false,
    videoId: null,
    upcoming: false,
    title: null,
    embedUrl: null,
    watchUrl: YOUTUBE_CHANNEL_URL,
    checkedAt,
  }
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return offline
    const html = await res.text()
    const videoId = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1]
    if (!videoId) return offline // the channel has no current or scheduled stream
    // Live now = playable, marked live, and not a stream that is only scheduled
    // (a scheduled stream reports status LIVE_STREAM_OFFLINE and isUpcoming).
    const upcoming = /"isUpcoming":true/.test(html)
    const live =
      /"playabilityStatus":\{"status":"OK"/.test(html) && /"isLive":true/.test(html) && !upcoming
    const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? null
    return {
      live,
      videoId,
      upcoming,
      title,
      embedUrl: live
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
        : null,
      watchUrl: live ? `https://www.youtube.com/watch?v=${videoId}` : YOUTUBE_CHANNEL_URL,
      checkedAt,
    }
  } catch {
    return offline
  }
}
