import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdRegistry from "@/components/AntdRegistry";
import AuthProvider from "@/components/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { WebSocketProvider } from "@/components/providers/WebSocketProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Express Management",
  description: "Express Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AntdRegistry>
            <WebSocketProvider enabled={true}>
              {children}
            </WebSocketProvider>
          </AntdRegistry>
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
