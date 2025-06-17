"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CalendarPlus,
  ExternalLink,
  Download,
  Smartphone,
  Monitor,
  Mail,
} from "lucide-react";
import { generateGoogleCalendarUrl, generateAppleCalendarUrl } from "@/lib/api";
import { toast } from "sonner";

interface CalendarIntegrationProps {
  booking: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    gym: {
      _id: string;
      name: string;
      address: string;
    };
  };
  className?: string;
}

export function CalendarIntegration({
  booking,
  className,
}: CalendarIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddToCalendar = async (
    provider: "google" | "outlook" | "apple"
  ) => {
    setIsGenerating(true);

    try {
      let url: string;

      switch (provider) {
        case "google":
          url = generateGoogleCalendarUrl(booking);
          window.open(url, "_blank");
          toast.success("Opening Google Calendar...");
          break;

        case "apple":
          url = generateAppleCalendarUrl(booking);
          const link = document.createElement("a");
          link.href = url;
          link.download = `gym-booking-${booking._id}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Calendar file downloaded!");
          break;
      }
    } catch (error) {
      console.error("Error generating calendar event:", error);
      toast.error("Failed to generate calendar event");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatBookingTime = () => {
    const date = new Date(booking.date);
    return `${date.toLocaleDateString()} at ${booking.startTime} - ${
      booking.endTime
    }`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Add to Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">{booking.gym.name}</p>
          <p>{formatBookingTime()}</p>
          <p>{booking.gym.address}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Choose your calendar app:</p>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleAddToCalendar("google")}
              disabled={isGenerating}
              className="justify-start"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Google Calendar
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAddToCalendar("outlook")}
              disabled={isGenerating}
              className="justify-start"
            >
              <Mail className="h-4 w-4 mr-2" />
              Outlook Calendar
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              onClick={() => handleAddToCalendar("apple")}
              disabled={isGenerating}
              className="justify-start"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Apple Calendar
              <Download className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">📅 Calendar Event Includes:</p>
          <ul className="space-y-1">
            <li>• Gym session details and location</li>
            <li>• 30-minute reminder before your workout</li>
            <li>• Gym address for easy navigation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for use in booking confirmations
export function CalendarIntegrationCompact({
  booking,
  className,
}: CalendarIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddToCalendar = async (
    provider: "google" | "outlook" | "apple"
  ) => {
    setIsGenerating(true);

    try {
      let url: string;

      switch (provider) {
        case "google":
          url = generateGoogleCalendarUrl(booking);
          window.open(url, "_blank");
          toast.success("Opening Google Calendar...");
          break;

        case "apple":
          url = generateAppleCalendarUrl(booking);
          const link = document.createElement("a");
          link.href = url;
          link.download = `gym-booking-${booking._id}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Calendar file downloaded!");
          break;
      }
    } catch (error) {
      console.error("Error generating calendar event:", error);
      toast.error("Failed to generate calendar event");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          className={className}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleAddToCalendar("google")}>
          <Monitor className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToCalendar("apple")}>
          <Smartphone className="h-4 w-4 mr-2" />
          Apple Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
