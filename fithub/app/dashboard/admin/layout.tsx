import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - FitHub",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
