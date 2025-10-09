import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const AdminActivityTracker = dynamic(() => import("@/components/admin/AdminActivityTracker"), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "رياضة الهجن الأردنية",
  description: "سباق الهدن الأردني",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminActivityTracker />
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
