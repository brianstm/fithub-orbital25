import type React from "react";
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | FitHub",
    default: "FitHub - Your Fitness Community",
  },
  description:
    "Book gyms, track workouts, and connect with fitness enthusiasts",
  keywords: ["fitness", "gym", "workout", "community", "booking", "AI trainer"],
  authors: [{ name: "Brians Tjipto and Kacey Yonathan" }],
  openGraph: {
    title: "FitHub - Your Fitness Community",
    description:
      "Book gyms, track workouts, and connect with fitness enthusiasts",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
