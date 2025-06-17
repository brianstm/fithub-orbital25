"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { fetchGyms } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Metadata } from "next";
import { PeakHoursDisplay } from "@/components/peak-hours-display";
import { CalendarIntegrationCompact } from "@/components/calendar-integration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GymsPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadGyms = async () => {
      setIsLoading(true);
      try {
        const response = await fetchGyms();
        setGyms(response.data.data);
        setFilteredGyms(response.data.data);
      } catch (error) {
        console.error("Error loading gyms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGyms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGyms(gyms);
    } else {
      const filtered = gyms.filter(
        (gym) =>
          gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          gym.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGyms(filtered);
    }
  }, [searchQuery, gyms]);

  const handleGymClick = (gymId: string) => {
    router.push(`/dashboard/gyms/${gymId}`);
  };

  return (
    <div className="space-y-6">
      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Local Fitness Centers</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Discover Gyms
            </h1>
            <p className="text-muted-foreground mt-1">
              Find and book your favorite gym facilities
            </p>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search gyms by name or location..."
              className="pl-8 focus:border-primary/60 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </BlurFade>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <MagicCard key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </MagicCard>
          ))
        ) : filteredGyms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No gyms found matching your search.
            </p>
          </div>
        ) : (
          filteredGyms.map((gym) => (
            <MagicCard
              key={gym._id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                {/* Image Carousel */}
                {gym.images && gym.images.length > 0 && (
                  <div className="h-48 w-full rounded-lg overflow-hidden relative">
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
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" />
                    </Carousel>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{gym.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {gym.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Capacity: {gym.capacity}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {gym.openingHours?.weekday?.open} -{" "}
                      {gym.openingHours?.weekday?.close}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gym.description}
                </p>

                {gym.amenities && gym.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {gym.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                    {gym.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        +{gym.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="peak-hours">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Peak Hours
                    </TabsTrigger>
                    <TabsTrigger value="book">Book</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Weekdays</p>
                        <p className="text-muted-foreground">
                          {gym.openingHours?.weekday?.open} -{" "}
                          {gym.openingHours?.weekday?.close}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Weekends</p>
                        <p className="text-muted-foreground">
                          {gym.openingHours?.weekend?.open} -{" "}
                          {gym.openingHours?.weekend?.close}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() =>
                        (window.location.href = `/dashboard/gyms/${gym._id}`)
                      }
                    >
                      View Details & Book
                    </Button>
                  </TabsContent>

                  <TabsContent value="peak-hours">
                    <div className="h-64 overflow-y-auto">
                      <PeakHoursDisplay gymId={gym._id} gymName={gym.name} />
                    </div>
                  </TabsContent>

                  <TabsContent value="book" className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Quick booking options and calendar integration
                    </p>
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() =>
                          (window.location.href = `/dashboard/gyms/${gym._id}/book`)
                        }
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = `/dashboard/gyms/${gym._id}#availability`)
                        }
                      >
                        Check Availability
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </MagicCard>
          ))
        )}
      </div>
    </div>
  );
}
