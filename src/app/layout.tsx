import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Aura - 个人数字空间",
  description: "Aura - 一个兼具技术名片与私密自留地性质的个人数字空间",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: "white",
                  border: "none",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
