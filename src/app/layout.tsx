import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// هنا نستدعي السحابة التي صنعتها أنت للتو
import { CartProvider } from "./context/CartContext";
import UserRoleGate from "@/components/UserRoleGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "تطبيق نعمة",
  description: "أنقذ وجبة، وفر مالك",
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
      </body>
    </html>
  );
}