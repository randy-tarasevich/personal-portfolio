/**
 * Until this date, only the slugs in BLOG_SLUGS_UNTIL_THEN are shown.
 * After this date, all blog posts are visible. Set to a past date to show all now.
 */
const BLOG_SHOW_ALL_DATE = new Date('2027-01-01')

/** Slugs to show until BLOG_SHOW_ALL_DATE. All others are hidden. */
const BLOG_SLUGS_UNTIL_THEN = ['crossfit-to-code']

export function isBlogPostVisible(id) {
  if (new Date() >= BLOG_SHOW_ALL_DATE) return true
  const slug = id.replace(/\.md$/, '')
  return BLOG_SLUGS_UNTIL_THEN.includes(slug)
}
