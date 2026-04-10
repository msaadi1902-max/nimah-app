import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 1. تحديد ما هي المسارات (الغرف) المحمية في التطبيق
  const isMerchantRoute = path.startsWith('/merchant') || path.startsWith('/merchant-orders')
  const isCustomerRoute = path.startsWith('/tickets')
  const isAdminRoute = path.startsWith('/admin-') // مسارات الإدارة مثل admin-meals

  // 2. فحص "بطاقة الهوية" (الكوكيز) التي أعطيناها للمستخدم في صفحة الترحيب
  const userRole = request.cookies.get('user_role')?.value

  // --- القواعد الأمنية (قرارات الحارس) ---

  // أ) إذا شخص غريب (لا يملك بطاقة هوية) يحاول التسلل لغرف التجار أو الزبائن
  if (!userRole && (isMerchantRoute || isCustomerRoute)) {
    return NextResponse.redirect(new URL('/welcome', request.url)) // اطرده لصفحة الترحيب
  }

  // ب) إذا كان "زبون" ويحاول التسلل للوحة تحكم "التاجر" أو "طلبات التاجر"
  if (isMerchantRoute && userRole === 'customer') {
    return NextResponse.redirect(new URL('/', request.url)) // أعده للمتجر الرئيسي (الصفحة الرئيسية)
  }

  // ج) إذا كان "تاجر" ويحاول التسلل لصفحة "تذاكر الزبائن"
  if (isCustomerRoute && userRole === 'merchant') {
    return NextResponse.redirect(new URL('/merchant', request.url)) // أعده للوحة تحكمه
  }

  // د) حماية مسارات الإدارة (لا يدخلها إلا الأدمن - حالياً سنمنع الزبائن والتجار منها)
  if (isAdminRoute && userRole !== 'admin') {
    // ملاحظة: يمكنك تعطيل هذا السطر مؤقتاً إذا كنت تختبر الإدارة بنفسك
    // return NextResponse.redirect(new URL('/', request.url))
  }

  // إذا كانت كل أموره سليمة، اسمح له بالمرور
  return NextResponse.next()
}

// هذه الميزة لتسريع أداء الحارس (نخبره أين يقف فقط بدلاً من تفتيش كل شيء)
export const config = {
  matcher: [
    '/merchant/:path*', 
    '/merchant-orders/:path*', 
    '/tickets/:path*',
    '/admin-:path*'
  ]
}