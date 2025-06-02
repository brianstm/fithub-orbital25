import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community - FitHub",
};

export default function GymsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 