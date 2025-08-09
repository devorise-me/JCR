"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Log page view on route change
    fetch("/api/admin-activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: "page_view", path: pathname }),
    }).catch(() => {});

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target?.closest("a,button") as HTMLElement | null;
      const descriptor = element?.getAttribute("aria-label") || element?.textContent?.trim()?.slice(0, 80) || element?.tagName || "unknown";
      fetch("/api/admin-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "click", path: pathname, element: descriptor }),
      }).catch(() => {});
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [pathname]);

  return null;
}


