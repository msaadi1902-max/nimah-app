import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isMerchantRoute = path.startsWith('/merchant') || path.startsWith('/merchant-orders') || path.startsWith('/merchant-dashboard')
  const isCustomerRoute = path.startsWith('/tickets')
  const isStaffRoute = path.startsWith('/staff-panel')
  const isMasterRoute = path.startsWith('/master-panel')

  const userRole = request.cookies.get('user_role')?.value

  // 👑 السماح بفتح بوابة الإدارة بمرونة عالية
  if (path.startsWith('/admin')) {
    return NextResponse.next()
  }

  // منع الغرباء
  if (!userRole && (isMerchantRoute || isCustomerRoute || isStaffRoute || isMasterRoute)) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  if (isMerchantRoute && userRole === 'customer') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isCustomerRoute && userRole === 'merchant') {
    return NextResponse.redirect(new URL('/merchant-dashboard', request.url))
  }

  if (isStaffRoute && userRole !== 'staff' && userRole !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isMasterRoute && userRole !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/merchant/:path*', 
    '/merchant-orders/:path*', 
    '/merchant-dashboard/:path*', 
    '/tickets/:path*',
    '/staff-panel/:path*',
    '/master-panel/:path*',
    '/admin/:path*'
  ]
}