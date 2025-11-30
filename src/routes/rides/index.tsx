import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCard } from "@/components/transport";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Calendar, Clock, Bus, History } from "lucide-react";
import { getParentBookings, cancelBooking } from "@/server/parent";

export const Route = createFileRoute("/rides/")({ component: RidesPage });

function RidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RidesContent />
    </Suspense>
  );
}

function RidesContent() {
  const queryClient = useQueryClient();

  const { data: bookingsData } = useSuspenseQuery({
    queryKey: ["parent-bookings"],
    queryFn: () => getParentBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking({ data: { bookingId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
    },
  });

  const upcomingBookings = bookingsData?.upcoming ?? [];
  const pastBookings = bookingsData?.past ?? [];

  // Transform bookings to match BookingCard props
  const transformBooking = (booking: (typeof upcomingBookings)[0]) => ({
    id: booking.id,
    studentName: booking.student?.name ?? "Unknown Student",
    pickupLocation:
      booking.pickupStop?.name ?? booking.trip?.route?.startPoint ?? "N/A",
    dropoffLocation:
      booking.dropoffStop?.name ?? booking.trip?.route?.endPoint ?? "N/A",
    scheduledTime: booking.trip?.date
      ? `${new Date(booking.trip.date).toLocaleDateString()}, ${
          booking.trip.scheduledStartTime || "TBD"
        }`
      : "TBD",
    busNumber: booking.trip?.vehicle?.busNumber ?? "TBD",
    driverName: booking.trip?.driver?.name ?? "TBD",
    status: booking.status as
      | "scheduled"
      | "confirmed"
      | "completed"
      | "cancelled",
    onCancel:
      booking.status !== "cancelled" && booking.status !== "completed"
        ? () => cancelMutation.mutate(booking.id)
        : undefined,
  });

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Rides</h1>
        <p className="text-gray-600">View and manage your bookings</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} {...transformBooking(booking)} />
              ))
            ) : (
              <Empty className="border py-16">
                <EmptyMedia variant="icon">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No upcoming rides</EmptyTitle>
                  <EmptyDescription>
                    You haven't booked any rides yet. Book a ride for your
                    child's safe commute to school.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link to="/book">
                    <Button>
                      <Bus className="w-4 h-4 mr-2" />
                      Book a Ride
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-3">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} {...transformBooking(booking)} />
              ))
            ) : (
              <Empty className="border py-16">
                <EmptyMedia variant="icon">
                  <History className="w-6 h-6 text-gray-600" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No ride history</EmptyTitle>
                  <EmptyDescription>
                    Once you complete rides, they'll appear here for your
                    records.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
