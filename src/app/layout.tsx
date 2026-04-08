import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientLayout } from "@/components/layout/client-layout";
import { Toaster } from "sonner";

const manrope = Manrope({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Белавто центр CRM",
  description: "CRM система для автодилера",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${manrope.className} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: "bg-surface border border-border text-textPrimary shadow-card-lg",
              style: {
                borderRadius: "12px",
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
