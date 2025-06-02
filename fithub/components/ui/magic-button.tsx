"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";
import { Sparkles } from "lucide-react";

interface MagicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  glowColor?: string;
  hoverScale?: boolean;
  sparkle?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MagicButton({
  className,
  children,
  glowColor = "rgba(var(--primary-rgb), 0.5)",
  hoverScale = true,
  sparkle = false,
  variant = "default",
  size = "default",
  ...props
}: MagicButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-out active:translate-y-1",
        hoverScale && "hover:scale-105",
        className
      )}
      variant={variant}
      size={size}
      {...props}
    >
      {/* Glow effect */}
      <span
        className="absolute inset-0 z-0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: glowColor,
        }}
      />

      {/* Content with optional sparkle icon */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {sparkle && <Sparkles className="h-4 w-4" />}
        {children}
      </span>
    </Button>
  );
}
