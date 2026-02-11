import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export const config = {
  matcher: '/api/:path*',
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = ['/api/sign-in', '/api/sign-up','/api/forget-password','/api/reset-password'] // Add any other public API routes here
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // ✅ Use lowercase header name (and keep a fallback)
  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Missing or invalid Authorization header' },
      { status: 401 },
    )
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    // ✅ Inject x-user-id and RETURN NextResponse.next immediately
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', String(payload.userId))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Middleware Auth Error:', error)
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 },
    )
  }
}
