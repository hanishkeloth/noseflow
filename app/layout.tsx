import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noseflow — Motion playground",
  description: "A Three.js motion playground controlled by your nose. Made by Hanish Keloth.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
