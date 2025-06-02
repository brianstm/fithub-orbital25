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
import { MapPin, Clock, Users, Search, Filter, Calendar, Sparkles } from "lucide-react";
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
import { MagicCard, MagicCardContent, MagicCardHeader } from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import type { Metadata } from "next";

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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="group hover:border-primary/60 hover:bg-primary/5">
              <Filter className="mr-2 h-4 w-4 group-hover:text-primary" />
              Filters
            </Button>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : filteredGyms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map((gym, index) => (
            <BlurFade key={gym._id} delay={0.1 + index * 0.05} direction="up">
              <GymCard
                gym={gym}
                onClick={() => handleGymClick(gym._id)}
              />
            </BlurFade>
          ))}
        </div>
      ) : (
        <BlurFade delay={0.1} direction="up">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No gyms found matching your search criteria.
            </p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}

interface GymCardProps {
  gym: Gym;
  onClick: () => void;
}

function GymCard({ gym, onClick }: GymCardProps) {
  return (
    <MagicCard
      className="overflow-hidden cursor-pointer"
      onClick={onClick}
      hoverEffect="border"
    >
      <div className="h-48 bg-primary/5 relative">
        {gym.images && gym.images.length > 0 ? (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent>
                {gym.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${gym.name} - Image ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 size-6" />
              <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 size-6" />
            </Carousel>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </div>
      <MagicCardHeader>
        <CardTitle className="group-hover:text-primary transition-colors">{gym.name}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {gym.address}
        </CardDescription>
      </MagicCardHeader>
      <MagicCardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {gym.amenities &&
            gym.amenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-none transition-colors">
                {amenity}
              </Badge>
            ))}
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="h-3.5 w-3.5 mr-1 text-primary/70" />
          <span>
            Open: {gym.openingHours?.weekday?.open} -{" "}
            {gym.openingHours?.weekday?.close}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-3.5 w-3.5 mr-1 text-primary/70" />
          <span>Capacity: {gym.capacity} people</span>
        </div>
        <div className="mt-4">
          <MagicButton className="w-full" hoverScale glowColor="rgba(var(--primary-rgb), 0.5)">
            <Calendar className="mr-2 h-4 w-4" />
            Book Now
          </MagicButton>
        </div>
      </MagicCardContent>
    </MagicCard>
  );
}
