import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// هنا نستدعي السحابة التي صنعتها
import { CartProvider } from "./context/CartContext";
import UserRoleGate from "@/components/UserRoleGate";

const inter = Inter({ subsets: ["latin"] });

// 1. إعدادات الهوية الأساسية وملف الـ PWA
export const metadata: Metadata = {
  title: "تطبيق نعمة",
  description: "أنقذ وجبة، وفر مالك",
  manifest: "/manifest.json",
};

// 2. لون شريط الهاتف من الأعلى
export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        {/* هنا نغلف التطبيق بالكامل لكي تصل السلة لكل الشاشات */}
        <CartProvider>
          <UserRoleGate>{children}</UserRoleGate>
        </CartProvider>
        
        {/* سكريبت تفعيل تطبيق الهاتف PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}