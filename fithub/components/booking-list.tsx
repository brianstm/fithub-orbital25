"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Check, X, Clock4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookingListProps } from "@/types";

export function BookingList({
  bookings = [],
  isLoading = false,
  showAll = false,
}: BookingListProps) {
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No bookings found.</p>
        <Button variant="outline" size="sm" className="mt-4">
          Book a Gym Session
        </Button>
      </div>
    );
  }

  const displayedBookings = showAll
    ? bookings
    : bookings.slice(0, displayCount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500"
          >
            <Clock4 className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {displayedBookings.map((booking) => (
        <div
          key={booking._id}
          className="flex items-start gap-4 p-3 border rounded-md"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{booking.gym.name}</h4>
              {getStatusBadge(booking.status)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(booking.date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{booking.gym.address}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {!showAll && bookings.length > displayCount && (
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
