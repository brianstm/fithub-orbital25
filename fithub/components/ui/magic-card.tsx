"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  hoverEffect?: "lift" | "glow" | "border" | "none";
  children: React.ReactNode;
}

export function MagicCard({
  className,
  gradient = false,
  hoverEffect = "lift",
  children,
  ...props
}: MagicCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-out",
        gradient && "bg-gradient-to-br from-background to-muted/50",
        hoverEffect === "lift" && "hover:translate-y-[-5px] hover:shadow-lg",
        hoverEffect === "glow" && "hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]",
        hoverEffect === "border" && "hover:border-primary",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function MagicCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("", className)} {...props} />;
}

export function MagicCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("", className)} {...props} />;
}

export function MagicCardFooter({
  className,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn("", className)} {...props} />;
} 