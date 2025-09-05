import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from '../components/ThemeProvider';
import { AntProvider } from '../components/providers/AntProvider';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: "PlanMate - Enterprise Task Management",
  description: "Professional task and project management platform for teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AntProvider>
              {children}
            </AntProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
