import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUserBadges } from "@/lib/api";
import { Award, Star, Flame, Dumbbell, Target, Trophy } from "lucide-react";
import { toast } from "sonner";

interface BadgeData {
  name: string;
  description: string;
  icon: string;
  category: "consistency" | "strength" | "milestone" | "achievement";
  earnedAt: string;
}

interface BadgeSelectorProps {
  selectedBadges: BadgeData[];
  onBadgeSelect: (badges: BadgeData[]) => void;
  className?: string;
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

export function BadgeSelector({ selectedBadges, onBadgeSelect, className }: BadgeSelectorProps) {
  const [availableBadges, setAvailableBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetchUserBadges();
      setAvailableBadges(response.data.data.badges || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast.error("Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeToggle = (badge: BadgeData, checked: boolean) => {
    if (checked) {
      onBadgeSelect([...selectedBadges, badge]);
    } else {
      onBadgeSelect(selectedBadges.filter(b => b.name !== badge.name));
    }
  };

  const isBadgeSelected = (badge: BadgeData) => {
    return selectedBadges.some(b => b.name === badge.name);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (availableBadges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Award className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No badges earned yet. Complete workouts to earn badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Share Your Badges</h3>
        </div>
        
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {availableBadges.map((badge) => {
              const colorClass = categoryColors[badge.category];
              const CategoryIcon = categoryIcons[badge.category];
              const isSelected = isBadgeSelected(badge);
              
              return (
                <div
                  key={badge.name}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    id={badge.name}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleBadgeToggle(badge, checked as boolean)}
                  />
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className={`p-2 rounded-full ${colorClass} text-white`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                        <Star className="h-2.5 w-2.5 text-yellow-800" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{badge.name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {badge.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {badge.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {selectedBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Selected badges ({selectedBadges.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedBadges.map((badge) => (
                <Badge key={badge.name} variant="secondary" className="text-xs">
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 