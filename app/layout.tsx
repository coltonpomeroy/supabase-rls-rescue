import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huddle Notes",
  description: "Simple notes for you and your team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} bg-slate-50 font-sans text-slate-900 antialiased`}>
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
