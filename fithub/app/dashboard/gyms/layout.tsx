import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gyms - FitHub",
};

export default function GymsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 