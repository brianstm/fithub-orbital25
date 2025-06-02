import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trainer - FitHub",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
