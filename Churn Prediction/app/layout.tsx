import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Churn Signal",
  description: "Customer churn risk monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
