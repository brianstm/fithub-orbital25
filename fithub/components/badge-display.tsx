import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Flame, Dumbbell, Target, Trophy } from "lucide-react";
import { BadgeData } from "@/types";

interface BadgeDisplayProps {
  badges: BadgeData[];
  className?: string;
  compact?: boolean;
}

const categoryColors = {
  consistency: "bg-blue-500",
  strength: "bg-red-500",
  milestone: "bg-green-500",
  achievement: "bg-purple-500",
};

const categoryIcons = {
  consistency: Flame,
  strength: Dumbbell,
  milestone: Target,
  achievement: Trophy,
};

export function BadgeDisplay({ badges, className, compact = false }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) return null;

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {badges.map((badge, index) => {
          const colorClass = categoryColors[badge.category];
          const CategoryIcon = categoryIcons[badge.category];
          
          return (
            <div
              key={`${badge.name}-${index}`}
              className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full px-3 py-1.5 border border-primary/20"
            >
              <div className="relative">
                <div className={`p-1 rounded-full ${colorClass} text-white`}>
                  <CategoryIcon className="h-3 w-3" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 rounded-full p-0.5">
                  <Star className="h-2 w-2 text-yellow-800" />
                </div>
              </div>
              <span className="text-xs font-medium">{badge.name}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Achievement Unlocked!</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {badges.length} badge{badges.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badge, index) => {
            const colorClass = categoryColors[badge.category];
            const CategoryIcon = categoryIcons[badge.category];
            
            return (
              <div
                key={`${badge.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="relative">
                  <div className={`p-2 rounded-full ${colorClass} text-white shadow-sm`}>
                    <CategoryIcon className="h-4 w-4" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                    <Star className="h-2.5 w-2.5 text-yellow-800" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{badge.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {badge.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 