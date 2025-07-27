"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { checkUserBadges } from "@/lib/api";

interface BadgeData {
  name: string;
  description: string;
  icon: string;
  category: "consistency" | "strength" | "milestone" | "achievement";
  earnedAt: string;
}

interface BadgeNotificationProps {
  badges: BadgeData[];
  onClose: () => void;
  className?: string;
}

const categoryColors = {
  consistency: "bg-blue-500",
  strength: "bg-red-500",
  milestone: "bg-green-500",
  achievement: "bg-purple-500",
};

const categoryEmojis = {
  consistency: "🔥",
  strength: "💪",
  milestone: "🎯",
  achievement: "🏆",
};

export function BadgeNotification({
  badges,
  onClose,
  className,
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    if (badges.length > 0) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [badges]);

  useEffect(() => {
    if (badges.length > 1 && currentBadgeIndex < badges.length - 1) {
      const timer = setTimeout(() => {
        setCurrentBadgeIndex((prev) => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentBadgeIndex, badges.length]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!badges.length || !isVisible) return null;

  const currentBadge = badges[currentBadgeIndex];
  const colorClass = categoryColors[currentBadge.category];

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        className
      )}
    >
      <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <div
          className={`absolute top-0 left-0 w-full h-1 ${colorClass} rounded-t-lg`}
        />

        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`p-3 rounded-full ${colorClass} text-white shadow-lg`}
                >
                  <Award className="h-6 w-6" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Sparkles className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-primary">
                  New Badge Earned! 🎉
                </CardTitle>
                <CardDescription className="text-sm">
                  {badges.length > 1 &&
                    `${currentBadgeIndex + 1} of ${badges.length}`}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">
              {categoryEmojis[currentBadge.category]}
            </div>
            <h3 className="text-xl font-bold">{currentBadge.name}</h3>
            <p className="text-sm text-muted-foreground">
              {currentBadge.description}
            </p>
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="capitalize">
              {currentBadge.category}
            </Badge>
          </div>

          {badges.length > 1 && (
            <div className="flex justify-center space-x-1">
              {badges.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentBadgeIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Dismiss
            </Button>
            <Button
              onClick={() => {
                handleClose();
                // Navigate to badges page
                window.location.href = "/dashboard/badges";
              }}
              className="flex-1"
              size="sm"
            >
              View All Badges
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check for new badges
export function useBadgeNotifications() {
  const [newBadges, setNewBadges] = useState<BadgeData[]>([]);

  const checkForNewBadges = async () => {
    try {
      const response = await checkUserBadges();
      if (response.data.data.newBadges && response.data.data.newBadges.length > 0) {
        setNewBadges(response.data.data.newBadges);

        // Show toast for each new badge
        response.data.data.newBadges.forEach((badge: BadgeData) => {
          toast.success(`New badge earned: ${badge.name}!`, {
            description: badge.description,
            duration: 4000,
          });
        });
      }
    } catch (error) {
      console.error("Error checking for new badges:", error);
    }
  };

  const clearBadges = () => {
    setNewBadges([]);
  };

  return {
    newBadges,
    checkForNewBadges,
    clearBadges,
  };
}
