import { timingSafeEqual } from 'node:crypto'

export const config = {
  matcher: String.raw`/((?!favicon\.ico).*)`,
}

const constantTimeEqual = (a: string, b: string): boolean => {
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  if (bufA.byteLength !== bufB.byteLength) return false
  return timingSafeEqual(bufA, bufB)
}

export default function middleware(request: Request): Response | undefined {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASSWORD

  if (!user || !pass) {
    return new Response('Authentication not configured', { status: 503 })
  }

  const auth = request.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const index = decoded.indexOf(':')
      if (index !== -1) {
        const providedUser = decoded.slice(0, index)
        const providedPass = decoded.slice(index + 1)
        if (constantTimeEqual(providedUser, user) && constantTimeEqual(providedPass, pass)) {
          return undefined
        }
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Restricted"' },
  })
}
