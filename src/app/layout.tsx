import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import UserRoleGate from "@/components/UserRoleGate";

const inter = Inter({ subsets: ["latin"] });

// 1. إعدادات الهوية والـ PWA المتقدمة لضمان العمل على آيفون وأندرويد
export const metadata: Metadata = {
  title: "نِعمة - لإنقاذ الطعام",
  description: "أنقذ وجبة، وفر مالك وحافظ على البيئة",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "نِعمة",
  },
};

// 2. إعدادات عرض الشاشة ولون شريط الهاتف
export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // لمنع تكبير الشاشة بشكل يفسد شكل التطبيق
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* أيقونة خاصة لأجهزة آيفون */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {/* تغليف التطبيق بالسلة وبوابة الأدوار */}
        <CartProvider>
          <UserRoleGate>
            {children}
          </UserRoleGate>
        </CartProvider>
        
        {/* سكريبت تفعيل الـ Service Worker عند تحميل الصفحة */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('PWA active:', reg.scope); },
                    function(err) { console.log('PWA error:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}