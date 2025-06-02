"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { fetchGymById, createBooking } from "@/lib/api";
import {
  MapPin,
  Clock,
  Users,
  CalendarIcon,
  ArrowLeft,
  Info,
  Star,
  Sparkles,
  Dumbbell,
  Building2,
} from "lucide-react";
import { format, getDay } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Gym } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export default function GymDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadGym = async () => {
      setIsLoading(true);
      try {
        const response = await fetchGymById(params.id as string);
        setGym(response.data.data);
      } catch (error) {
        console.error("Error loading gym details:", error);
        toast.error("Failed to load gym details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadGym();
    }
  }, [params.id]);

  const handleBooking = async () => {
    if (!selectedTimeSlot || !gym) {
      toast.error("Please select a time slot.");
      return;
    }

    setIsBooking(true);
    try {
      const [startTime, endTime] = selectedTimeSlot.split(" - ");
      await createBooking({
        gym: params.id as string,
        date: format(date, "yyyy-MM-dd"),
        startTime,
        endTime,
      });

      toast.success(
        `You've booked ${gym.name} on ${format(
          date,
          "MMMM d, yyyy"
        )} at ${startTime}.`
      );

      router.push("/dashboard/bookings");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(
        error.message || "Failed to create booking. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  const getOpeningHours = () => {
    const day = getDay(date);
    // 0 is Sunday, 6 is Saturday
    const isWeekend = day === 0 || day === 6;

    if (!gym) {
      return {
        open: "08:00",
        close: "20:00",
      };
    }

    if (isWeekend) {
      return {
        open: gym.openingHours?.weekend?.open || "09:00",
        close: gym.openingHours?.weekend?.close || "17:00",
      };
    }

    return {
      open: gym.openingHours?.weekday?.open || "08:00",
      close: gym.openingHours?.weekday?.close || "20:00",
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="h-64 w-full">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Gym Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The gym you're looking for doesn't exist or has been removed.
        </p>
        <MagicButton onClick={() => router.push("/dashboard/gyms")} hoverScale>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gyms
        </MagicButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BlurFade delay={0} direction="up">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gyms
          </Button>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <div className="md:h-96 h-48 w-full rounded-lg overflow-hidden relative">
          {gym.images && gym.images.length > 0 ? (
            <div className="relative h-full">
              <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="h-full"
              >
                <CarouselContent className="h-full">
                  {gym.images.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="h-full w-full relative overflow-hidden rounded-lg">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${gym.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </Carousel>
            </div>
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-lg">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlurFade
          delay={0.2}
          direction="up"
          className="lg:col-span-2 space-y-6"
        >
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Fitness Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              {gym.name}
            </h1>
            <div className="flex items-center mt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5" />
              <span>{gym.address}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {gym.amenities &&
              gym.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-none transition-colors"
                >
                  {amenity}
                </Badge>
              ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MagicCard
              hoverEffect="border"
              className="overflow-hidden flex justify-center"
            >
              <MagicCardContent className="flex items-center">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Opening Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Weekdays: {gym.openingHours?.weekday?.open} -{" "}
                    {gym.openingHours?.weekday?.close}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Weekends: {gym.openingHours?.weekend?.open || "Closed"} -{" "}
                    {gym.openingHours?.weekend?.close || ""}
                  </p>
                </div>
              </MagicCardContent>
            </MagicCard>

            <MagicCard
              hoverEffect="border"
              className="overflow-hidden flex justify-center"
            >
              <MagicCardContent className="flex items-center">
                <div className="p-2 rounded-full bg-primary/10 mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum {gym.capacity} people at a time
                  </p>
                </div>
              </MagicCardContent>
            </MagicCard>
          </div>

          <MagicCard hoverEffect="border" className="overflow-hidden">
            <MagicCardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                About This Gym
              </CardTitle>
            </MagicCardHeader>
            <MagicCardContent className="pb-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger
                    value="facilities"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Facilities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {gym.description ||
                        "No description available for this gym."}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="facilities">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gym.facilities && gym.facilities.length > 0 ? (
                      gym.facilities.map((facility, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 border border-border/40 rounded-lg group hover:border-primary/40 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                            <Dumbbell className="h-4 w-4 text-primary" />
                          </div>
                          <span>{facility}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-2 text-center py-4">
                        No facilities information available
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </MagicCardContent>
          </MagicCard>
        </BlurFade>

        <BlurFade delay={0.3} direction="up">
          <MagicCard hoverEffect="glow">
            <MagicCardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Book This Gym
              </CardTitle>
              <CardDescription>
                Select a date and time to book your session
              </CardDescription>
            </MagicCardHeader>
            <MagicCardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border max-w-full flex items-center justify-center"
                  disabled={{ before: new Date() }}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Time Slot</h3>
                <TimeSlotPicker
                  openTime={getOpeningHours().open}
                  closeTime={getOpeningHours().close}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectTimeSlot={setSelectedTimeSlot}
                />
                <p className="text-xs text-muted-foreground">
                  {getDay(date) === 0 || getDay(date) === 6
                    ? "Weekend Hours"
                    : "Weekday Hours"}
                </p>
              </div>

              <MagicButton
                className="w-full"
                onClick={handleBooking}
                disabled={isBooking || !selectedTimeSlot}
                hoverScale
                glowColor="rgba(var(--primary-rgb), 0.5)"
              >
                {isBooking ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2 rounded-full animate-pulse" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Book Now
                  </>
                )}
              </MagicButton>
            </MagicCardContent>
          </MagicCard>
        </BlurFade>
      </div>
    </div>
  );
}
