import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import AntdProvider from "@/components/AntdProvider";
import SessionProvider from "@/components/SessionProvider";
import ClearLegacyStorage from "@/components/ClearLegacyStorage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartMall - Smart Shopping Experience",
  description: "Leading e-commerce platform with modern design and exceptional user experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AntdProvider>
            <AuthProvider>
              <UserProfileProvider>
                <ClearLegacyStorage />
                {children}
              </UserProfileProvider>
            </AuthProvider>
          </AntdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
