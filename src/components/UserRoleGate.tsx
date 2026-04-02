"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * localStorage only exists in the browser — RootLayout (server) and middleware
 * (edge) cannot read it. This client wrapper runs after hydration and redirects
 * first-time visitors (no user_role) to /welcome.
 */
export default function UserRoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/welcome") return;

    try {
      const role = localStorage.getItem("user_role");
      if (!role) {
        router.replace("/welcome");
      }
    } catch {
      // private mode / storage blocked — send to welcome to pick role
      router.replace("/welcome");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
