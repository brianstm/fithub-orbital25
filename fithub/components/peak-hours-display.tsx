"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { fetchGymPeakHours, fetchGymAvailability } from "@/lib/api";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface PeakHoursDisplayProps {
  gymId: string;
  gymName: string;
  className?: string;
}

interface PeakHoursData {
  gym: {
    _id: string;
    name: string;
    capacity: number;
  };
  peakHours: {
    [day: string]: {
      peak: number[];
      offPeak: number[];
    };
  };
  hourlyData: {
    [day: string]: {
      [hour: number]: number;
    };
  };
  overallHourlyBusyness: {
    [hour: number]: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    hours?: string[];
    suggestion?: string;
  }>;
}

interface AvailabilityData {
  gym: {
    _id: string;
    name: string;
    capacity: number;
  };
  date: string;
  dayOfWeek: string;
  hourlyAvailability: Array<{
    hour: number;
    timeSlot: string;
    availableSlots: number;
    occupancy: number;
    occupancyRate: number;
    busyLevel: "low" | "medium" | "high";
    isPeakHour: boolean;
    isOffPeakHour: boolean;
    recommended: boolean;
  }>;
  summary: {
    totalSlots: number;
    bookedSlots: number;
    peakHours: number[];
    offPeakHours: number[];
  };
}

export function PeakHoursDisplay({
  gymId,
  gymName,
  className,
}: PeakHoursDisplayProps) {
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursData | null>(
    null
  );
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPeakHoursData();
  }, [gymId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailabilityData();
    }
  }, [gymId, selectedDate]);

  const fetchPeakHoursData = async () => {
    try {
      const response = await fetchGymPeakHours(gymId);
      setPeakHoursData(response.data.data);
    } catch (error) {
      console.error("Error fetching peak hours:", error);
      toast.error("Failed to load peak hours data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityData = async () => {
    try {
      const response = await fetchGymAvailability(gymId, selectedDate);
      setAvailabilityData(response.data.data);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability data");
    }
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const getBusyLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBusyLevelText = (level: string) => {
    switch (level) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!peakHoursData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Unable to load peak hours data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Peak Hours & Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Pattern</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Recommendations */}
            {peakHoursData.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Recommendations</h4>
                {peakHoursData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {rec.description}
                        </p>
                        {rec.suggestion && (
                          <p className="text-xs text-primary mt-1">
                            {rec.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Overall Busyness Chart */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">
                Overall Busyness by Hour
              </h4>
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                {Object.entries(peakHoursData.overallHourlyBusyness).map(
                  ([hour, busyness]) => {
                    const hourNum = parseInt(hour);
                    const intensity = Math.min((busyness as number) / 5, 1); // Normalize to 0-1
                    const opacity = Math.max(0.1, intensity);

                    return (
                      <div
                        key={hour}
                        className="text-center p-2 rounded border"
                        style={{
                          backgroundColor: `rgba(var(--primary-rgb), ${opacity})`,
                          color: intensity > 0.5 ? "white" : "inherit",
                        }}
                      >
                        <div className="text-xs font-medium">
                          {formatHour(hourNum)}
                        </div>
                        <div className="text-xs">
                          {Math.round(busyness as number)}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Numbers represent average bookings per hour. Darker = busier.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="space-y-4">
              {Object.entries(peakHoursData.peakHours).map(([day, hours]) => (
                <div key={day} className="space-y-2">
                  <h4 className="font-semibold text-sm">{day}</h4>
                  <div className="flex flex-wrap gap-2">
                    {hours.peak.length > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-muted-foreground">
                          Peak:
                        </span>
                        {hours.peak.map((hour) => (
                          <Badge
                            key={hour}
                            variant="destructive"
                            className="text-xs"
                          >
                            {formatHour(hour)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {hours.offPeak.length > 0 && (
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">
                          Off-peak:
                        </span>
                        {hours.offPeak.map((hour) => (
                          <Badge
                            key={hour}
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            {formatHour(hour)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {hours.peak.length === 0 && hours.offPeak.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        No data available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border rounded px-2 py-1"
                min={format(new Date(), "yyyy-MM-dd")}
                max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
              />
            </div>

            {availabilityData && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">
                      {availabilityData.summary.peakHours.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Peak Hours
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold">
                      {availabilityData.summary.offPeakHours.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Off-Peak Hours
                    </div>
                  </div>
                </div>

                {/* Hourly Availability */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">
                    Hourly Availability - {availabilityData.dayOfWeek}
                  </h4>
                  <div className="space-y-2">
                    {availabilityData.hourlyAvailability.map((slot) => (
                      <div
                        key={slot.hour}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          slot.recommended
                            ? "border-green-500 bg-green-50"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-sm">
                            {slot.timeSlot}
                          </div>
                          <div className="flex items-center gap-2">
                            {slot.isPeakHour && (
                              <Badge variant="destructive" className="text-xs">
                                Peak
                              </Badge>
                            )}
                            {slot.isOffPeakHour && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-green-100 text-green-800"
                              >
                                Off-Peak
                              </Badge>
                            )}
                            {slot.recommended && (
                              <Badge
                                variant="outline"
                                className="text-xs border-green-500 text-green-700"
                              >
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            <span className="font-medium">
                              {slot.availableSlots}
                            </span>
                            <span className="text-muted-foreground">
                              /{peakHoursData.gym.capacity} available
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-3 h-3 rounded-full ${getBusyLevelColor(
                                slot.busyLevel
                              )}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {getBusyLevelText(slot.busyLevel)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
