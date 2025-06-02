"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GymListProps, Gym } from "@/types";

export function GymList({
  gyms = [],
  isLoading = false,
  showAll = false,
}: GymListProps) {
  const [displayCount, setDisplayCount] = useState(5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 border rounded-md"
            >
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No gyms found.</p>
        <Button variant="outline" size="sm" className="mt-4">
          Search Gyms
        </Button>
      </div>
    );
  }

  const displayedGyms = showAll ? gyms : gyms.slice(0, displayCount);

  return (
    <div className="space-y-4">
      {displayedGyms.map((gym: Gym) => (
        <Link
          href={`/dashboard/gyms/${gym._id}`}
          key={gym._id}
          className="flex items-start gap-4 p-3 border rounded-md hover:bg-accent transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{gym.name}</h4>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{gym.rating}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{gym.address}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {gym.openingHours?.weekday
                    ? `${gym.openingHours.weekday.open}-${gym.openingHours.weekday.close}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{gym.reviews || 0} reviews</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {gym.facilities?.map((facility: string) => (
                <Badge key={facility} variant="secondary">
                  {facility}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      ))}

      {!showAll && gyms.length > displayCount && (
        <div className="text-center pt-2">
          <Button
            variant="link"
            onClick={() => setDisplayCount((prev) => prev + 5)}
            className="text-sm"
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}
