/** The "Photos & Videos" admin section, with its uploads populated. Empty fields are null. */
export const getSitePhotos = (payload) => payload.findGlobal({ slug: 'site-photos', depth: 1 })

/** Banner photo for an inner page (e.g. 'services'), or undefined when none is uploaded. */
export const bannerFor = (photos, page) => photos?.banners?.[page] || undefined
