"use client";

import { useEffect, useState } from "react";
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
import { fetchUserBookings, cancelBooking } from "@/lib/api";
import {
  CalendarIcon,
  MapPin,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
  Clock4,
  Sparkles,
  CalendarDays,
  Calendar1Icon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Booking } from "@/types";
import { useRouter } from "next/navigation";
import {
  MagicCard,
  MagicCardContent,
  MagicCardHeader,
} from "@/components/ui/magic-card";
import { MagicButton } from "@/components/ui/magic-button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ScrollProgress } from "@/components/magicui/scroll-progress";

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingDates, setBookingDates] = useState<Date[]>([]);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetchUserBookings();
        const bookingsData = response.data.data || [];
        setBookings(bookingsData);

        // Extract dates for calendar highlighting
        const dates = bookingsData.map(
          (booking: Booking) => new Date(booking.date)
        );
        setBookingDates(dates);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsAlertOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    
    try {
      await cancelBooking(bookingToCancel);
      setBookings(
        bookings.map((booking) =>
          booking._id === bookingToCancel
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setBookingToCancel(null);
      setIsAlertOpen(false);
    }
  };

  // Filter bookings for different tabs
  const upcomingBookings = bookings.filter(
    (booking) =>
      new Date(booking.date) > new Date() && booking.status !== "cancelled"
  );

  const pastBookings = bookings.filter(
    (booking) =>
      new Date(booking.date) < new Date() && booking.status !== "cancelled"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  // Filter bookings for selected date
  const bookingsForSelectedDate = bookings.filter(
    (booking) =>
      format(new Date(booking.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Cancel Booking
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BlurFade delay={0} direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-sm font-medium">Gym Reservations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Your Bookings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your upcoming and past gym sessions
            </p>
          </div>
          <MagicButton
            onClick={() => router.push("/dashboard/gyms")}
            hoverScale
            glowColor="rgba(var(--primary-rgb), 0.5)"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Book a Gym
          </MagicButton>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} direction="up">
        <div className="grid gap-6 md:grid-cols-5">
          <MagicCard className="md:col-span-3" hoverEffect="border">
            <MagicCardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                View and manage your gym reservations
              </CardDescription>
            </MagicCardHeader>
            <MagicCardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Past
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Cancelled
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="space-y-4">
                  {isLoading ? (
                    Array(2)
                      .fill(0)
                      .map((_, index) => <BookingSkeleton key={index} />)
                  ) : upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking, index) => (
                      <BlurFade
                        key={booking._id}
                        delay={0.1 + index * 0.05}
                        direction="up"
                      >
                        <BookingCard
                          booking={booking}
                          onCancel={() => handleCancelClick(booking._id)}
                        />
                      </BlurFade>
                    ))
                  ) : (
                    <BlurFade delay={0.2} direction="up">
                      <MagicCard className="text-center p-8" hoverEffect="glow">
                        <MagicCardContent>
                          <CalendarDays className="h-12 w-12 mx-auto text-primary mb-4" />
                          <p className="text-lg font-medium mb-2">
                            No upcoming bookings
                          </p>
                          <p className="text-muted-foreground mb-4">
                            You don't have any upcoming <br />
                            gym reservations
                          </p>
                          <MagicButton
                            onClick={() => router.push("/dashboard/gyms")}
                          >
                            <Calendar1Icon className="w-4 h-4" />
                            Book a Gym
                          </MagicButton>
                        </MagicCardContent>
                      </MagicCard>
                    </BlurFade>
                  )}
                </TabsContent>
                <TabsContent value="past" className="space-y-4">
                  {isLoading ? (
                    Array(2)
                      .fill(0)
                      .map((_, index) => <BookingSkeleton key={index} />)
                  ) : pastBookings.length > 0 ? (
                    pastBookings.map((booking, index) => (
                      <BlurFade
                        key={booking._id}
                        delay={0.1 + index * 0.05}
                        direction="up"
                      >
                        <BookingCard booking={booking} isPast />
                      </BlurFade>
                    ))
                  ) : (
                    <BlurFade delay={0.2} direction="up">
                      <MagicCard className="text-center p-8" hoverEffect="glow">
                        <MagicCardContent>
                          <Clock4 className="h-12 w-12 mx-auto text-primary mb-4" />
                          <p className="text-lg font-medium mb-2">
                            No past bookings
                          </p>
                          <p className="text-muted-foreground mb-4">
                            You don't have any completed
                            <br /> gym sessions yet
                          </p>
                        </MagicCardContent>
                      </MagicCard>
                    </BlurFade>
                  )}
                </TabsContent>
                <TabsContent value="cancelled" className="space-y-4">
                  {isLoading ? (
                    Array(2)
                      .fill(0)
                      .map((_, index) => <BookingSkeleton key={index} />)
                  ) : cancelledBookings.length > 0 ? (
                    cancelledBookings.map((booking, index) => (
                      <BlurFade
                        key={booking._id}
                        delay={0.1 + index * 0.05}
                        direction="up"
                      >
                        <BookingCard booking={booking} isCancelled />
                      </BlurFade>
                    ))
                  ) : (
                    <BlurFade delay={0.2} direction="up">
                      <MagicCard className="text-center p-8" hoverEffect="glow">
                        <MagicCardContent>
                          <X className="h-12 w-12 mx-auto text-primary mb-4" />
                          <p className="text-lg font-medium mb-2">
                            No cancelled bookings
                          </p>
                          <p className="text-muted-foreground mb-4">
                            You don't have any
                            <br /> cancelled reservations
                          </p>
                        </MagicCardContent>
                      </MagicCard>
                    </BlurFade>
                  )}
                </TabsContent>
              </Tabs>
            </MagicCardContent>
          </MagicCard>

          <MagicCard className="md:col-span-2" hoverEffect="glow">
            <MagicCardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>View your bookings by date</CardDescription>
            </MagicCardHeader>
            <MagicCardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border w-full flex items-center justify-center"
                modifiers={{
                  booked: bookingDates,
                }}
                modifiersStyles={{
                  booked: {
                    backgroundColor: "rgba(var(--primary-rgb), 0.15)",
                    fontWeight: "bold",
                    color: "var(--primary)",
                    border: "1px solid rgba(var(--primary-rgb), 0.2)",
                  },
                }}
              />

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Bookings for {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                {bookingsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsForSelectedDate.map((booking, index) => (
                      <BlurFade
                        key={booking._id}
                        delay={0.1 + index * 0.05}
                        direction="up"
                      >
                        <MagicCard
                          key={booking._id}
                          className="overflow-hidden"
                          hoverEffect="border"
                        >
                          <MagicCardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-primary">
                                {booking.gym?.name || "Unknown Gym"}
                              </h4>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
                              <span>
                                {booking?.startTime +
                                  " - " +
                                  booking?.endTime || "Time not specified"}
                              </span>
                            </div>
                          </MagicCardContent>
                        </MagicCard>
                      </BlurFade>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No bookings for this date
                  </p>
                )}
              </div>
            </MagicCardContent>
          </MagicCard>
        </div>
      </BlurFade>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  isPast = false,
  isCancelled = false,
}: {
  booking: Booking;
  onCancel?: () => void;
  isPast?: boolean;
  isCancelled?: boolean;
}) {
  const bookingDate = new Date(booking.date);
  const formattedDate = format(bookingDate, "EEEE, MMMM d, yyyy");
  const isToday =
    format(bookingDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const statusStyles = {
    pending: {
      background: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <Clock4 className="h-4 w-4 mr-1.5 text-yellow-800" />,
      label: "Pending",
    },
    confirmed: {
      background: "bg-green-100",
      text: "text-green-800",
      icon: <CheckCircle className="h-4 w-4 mr-1.5 text-green-800" />,
      label: "Confirmed",
    },
    cancelled: {
      background: "bg-red-100",
      text: "text-red-800",
      icon: <X className="h-4 w-4 mr-1.5 text-red-800" />,
      label: "Cancelled",
    },
  };

  const status = booking.status || "pending";
  const statusStyle = statusStyles[status as keyof typeof statusStyles];

  return (
    <MagicCard className="overflow-hidden" hoverEffect="border">
      <MagicCardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div
            className={`p-6 md:w-1/3 flex items-center justify-center md:rounded-md rounded-none
            ${
              isPast
                ? "bg-muted/50"
                : isCancelled
                ? "bg-red-500/10"
                : "bg-primary/10"
            }`}
          >
            <div className="text-center">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                {isToday ? "Today" : format(bookingDate, "EEEE")}
              </h3>
              <p className="text-2xl font-bold text-primary">
                {format(bookingDate, "d")}
              </p>
              <p className="font-medium text-sm text-muted-foreground">
                {format(bookingDate, "MMMM yyyy")}
              </p>
            </div>
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {booking.gym?.name || "Unknown Gym"}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-primary/60" />
                  {booking.gym?.address || "Address not available"}
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
                <span>
                  {booking?.startTime + " - " + booking?.endTime ||
                    "Time not specified"}
                </span>
              </div>
            </div>

            {!isPast && !isCancelled && onCancel && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </MagicCardContent>
    </MagicCard>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "confirmed":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-600 border-none transition-colors"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-600 border-none transition-colors"
        >
          <Clock4 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-600 border-none transition-colors"
        >
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-none transition-colors"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
  }
}

function BookingSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="p-6 md:w-1/3 bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="h-4 w-16 mb-1 mx-auto" />
              <Skeleton className="h-8 w-8 mb-1 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
