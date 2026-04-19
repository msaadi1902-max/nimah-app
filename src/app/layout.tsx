import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import UserRoleGate from "@/components/UserRoleGate";

const inter = Inter({ subsets: ["latin"] });

// 1. إعدادات الهوية والـ PWA المتقدمة
export const metadata: Metadata = {
  title: "نِعمة - لإنقاذ الطعام",
  description: "أنقذ وجبة، وفر مالك وحافظ على البيئة",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
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
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* أيقونات إضافية لضمان التثبيت على كافة الأنظمة */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <UserRoleGate>
            {children}
          </UserRoleGate>
        </CartProvider>
        
        {/* سكريبت تفعيل الـ Service Worker */}
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