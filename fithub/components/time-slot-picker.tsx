"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeSlotPickerProps {
  openTime: string;
  closeTime: string;
  selectedTimeSlot: string | null;
  onSelectTimeSlot: (timeSlot: string) => void;
}

export function TimeSlotPicker({
  openTime = "06:00",
  closeTime = "22:00",
  selectedTimeSlot,
  onSelectTimeSlot,
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const slots = generateTimeSlots(openTime, closeTime);
    setTimeSlots(slots);
  }, [openTime, closeTime]);

  const generateTimeSlots = (start: string, end: string) => {
    const slots: string[] = [];
    const startTime = parseTime(start);
    const endTime = parseTime(end);

    // Create 1-hour slots
    let current = startTime;
    while (current < endTime) {
      const slotStart = formatTime(current);

      // Add 30 minutes
      current += 30;

      // Don't create a slot that extends beyond closing time
      if (current <= endTime) {
        const slotEnd = formatTime(current);
        slots.push(`${slotStart} - ${slotEnd}`);
      }
    }

    return slots;
  };

  // Parse time string (HH:MM) to minutes
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Format minutes to time string (HH:MM)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <ScrollArea className="h-48 rounded-md border">
      <div className="p-2 grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot}
            variant={selectedTimeSlot === slot ? "default" : "outline"}
            className="w-full"
            onClick={() => onSelectTimeSlot(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
