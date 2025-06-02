import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings - FitHub",
};

export default function GymsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 