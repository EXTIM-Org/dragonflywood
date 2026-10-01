import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/store/CartContext";
import { getSession } from "@/lib/session";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | گالری چوب سنجاقک",
    default: "گالری چوب سنجاقک | صنایع دستی و سازه‌های چوبی فاخر",
  },
  description: "خرید آنلاین انواع ظروف، دکوراسیون و دست‌سازه‌های چوبی نفیس با اصالت چوب طبیعی از گالری چوب سنجاقک",
  openGraph: {
    title: "گالری چوب سنجاقک | صنایع دستی و سازه‌های چوبی فاخر",
    description: "خرید آنلاین انواع ظروف، دکوراسیون و دست‌سازه‌های چوبی نفیس با اصالت چوب طبیعی از گالری چوب سنجاقک",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "گالری چوب سنجاقک",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "گالری چوب سنجاقک",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "گالری چوب سنجاقک | صنایع دستی و سازه‌های چوبی فاخر",
    description: "خرید آنلاین انواع ظروف، دکوراسیون و دست‌سازه‌های چوبی نفیس با اصالت چوب طبیعی از گالری چوب سنجاقک",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="font-vazirmatn-fd antialiased bg-background text-foreground min-h-screen transition-colors duration-300 flex flex-col overflow-x-hidden" style={{ fontFamily: '"Vazirmatn FD", system-ui, sans-serif' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CartProvider isLoggedIn={!!session?.userId}>
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: '#333',
                  color: '#fff',
                  fontFamily: 'var(--font-vazirmatn)',
                  borderRadius: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Header session={session} />
            <main className="flex-1 flex flex-col relative">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
