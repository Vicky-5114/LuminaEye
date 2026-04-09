import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuminaEye | AI-Powered Navigation for the Visually Impaired",
  description: "Experience the future of accessibility. LuminaEye uses advanced AI to provide real-time navigation assistance for the visually impaired.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-void text-white overflow-x-hidden">{children}</body>
    </html>
  );
}
