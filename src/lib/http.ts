export function resolveServiceUrl(serviceUrl: string, path: string): string {
  let baseUrl: URL
  try {
    baseUrl = new URL(serviceUrl)
  } catch {
    throw new Error('AUTH_SERVICE_URL must be an absolute HTTP(S) URL')
  }
  if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
    throw new Error('AUTH_SERVICE_URL must be an absolute HTTP(S) URL')
  }
  return new URL(path, baseUrl).href
}
