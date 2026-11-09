/**
 * Validates a redirect URL to prevent open redirects.
 * Only allows same-origin paths (starting with / but not //).
 */
export function isValidRedirect(url: string | null): boolean {
  if (!url) return false
  return url.startsWith('/') && !url.startsWith('//')
}

/**
 * Extracts the redirect parameter from URL search params.
 */
export function getRedirectParam(location: { search: string }): string | null {
  const params = new URLSearchParams(location.search)
  const redirect = params.get('redirect')
  return isValidRedirect(redirect) ? redirect : null
}

/**
 * Builds a link with the redirect parameter preserved.
 */
export function buildLinkWithRedirect(path: string, redirect: string | null): string {
  if (!redirect) return path
  return `${path}?redirect=${encodeURIComponent(redirect)}`
}
