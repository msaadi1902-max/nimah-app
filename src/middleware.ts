import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. جلب "دور المستخدم" من الكوكيز (Cookies)
  const role = request.cookies.get('user_role')?.value

  // 2. إذا كان المستخدم في صفحة الترحيب، اتركه يكمل
  if (request.nextUrl.pathname === '/welcome') {
    return NextResponse.next()
  }

  // 3. إذا لم يحدد دوره بعد (لا يوجد كوكيز)، وجهه لصفحة الترحيب فوراً
  if (!role) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  return NextResponse.next()
}

// تحديد الصفحات التي ينطبق عليها هذا "الحارس"
export const config = {
  matcher: [
    /*
     * استثناء الملفات الثابتة (صور، أيقونات) وتطبيقها على كل المسارات الأخرى
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}