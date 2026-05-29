import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vocab JP",
  description: "Japanese vocabulary learning app",
};

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/study", label: "Study" },
  { href: "/quiz", label: "Quiz" },
  { href: "/words", label: "Words" },
  { href: "/stats", label: "Stats" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-6 max-w-7xl mx-auto">
            <Link href="/" className="font-bold text-lg tracking-tight">Vocab JP</Link>
            <nav className="flex items-center gap-4 text-sm ml-6">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
