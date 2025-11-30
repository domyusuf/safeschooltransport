import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPlaceholder, StatusBadge } from "@/components/transport";
import { getParentBookings, cancelBooking } from "@/server";
import {
  ArrowLeft,
  Bus,
  Clock,
  MapPin,
  Phone,
  User,
  Navigation,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/rides/$rideId")({
  component: RideDetailsPage,
});

function RideDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RideDetails />
    </Suspense>
  );
}

function RideDetails() {
  const { rideId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookingsData } = useSuspenseQuery({
    queryKey: ["parentBookings"],
    queryFn: () => getParentBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking({ data: { bookingId: rideId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parentBookings"] });
      navigate({ to: "/rides" });
    },
  });

  // Find the booking by ID
  const booking = bookingsData?.all?.find((b) => b.id === rideId);

  if (!booking) {
    return (
      <div className="p-4">
        <Link
          to="/rides"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Rides</span>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Booking not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mapStatus = (
    status: string
  ): "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" => {
    if (status === "active") return "in-progress";
    if (status === "scheduled") return "confirmed";
    return status as
      | "pending"
      | "confirmed"
      | "in-progress"
      | "completed"
      | "cancelled";
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 pt-2">
        <Link
          to="/rides"
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Rides</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Ride Details</h1>
            <p className="text-blue-100 flex items-center gap-2 mt-1">
              <User className="w-4 h-4" />
              {booking.student.name}
            </p>
          </div>
          <StatusBadge status={mapStatus(booking.trip.status)} />
        </div>
      </div>

      {/* Live Map */}
      <div className="p-4">
        <MapPlaceholder
          className="h-56 rounded-xl"
          showPins
          label="Live Bus Location"
        />

        {/* Trip Info Card */}
        <Card className="mt-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trip Date</p>
                <p className="text-xl font-bold text-blue-600">
                  {new Date(booking.trip.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button size="lg">
              <Navigation className="w-5 h-5 mr-2" />
              Navigate
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Route Info */}
      <div className="px-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="font-medium">
                    {booking.pickupStop?.name ?? "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drop-off</p>
                  <p className="font-medium">
                    {booking.dropoffStop?.name ?? "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Info */}
      <div className="px-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {(booking.trip.driver?.name ?? "D")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {booking.trip.driver?.name ?? "Unassigned"}
                </p>
                <p className="text-sm text-gray-500">
                  Route: {booking.trip.route.name}
                </p>
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Info */}
      <div className="px-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.trip.vehicle?.busNumber ?? "Not assigned"}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.trip.vehicle?.licensePlate ?? "N/A"}
                </p>
              </div>
              <div className="w-20 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Bus className="w-8 h-8 text-yellow-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      {booking.status !== "cancelled" && booking.status !== "completed" && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t p-4">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <Phone className="w-5 h-5 mr-2" />
              Call Driver
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Ride"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
