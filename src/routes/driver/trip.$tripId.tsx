import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPlaceholder, StatusBadge } from "@/components/transport";
import {
  getDriverTrip,
  updateTripStatus,
  updatePassengerStatus,
} from "@/server/driver";
import {
  ArrowLeft,
  MapPin,
  Users,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/driver/trip/$tripId")({
  component: ActiveTripPage,
});

function ActiveTripPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ActiveTripContent />
    </Suspense>
  );
}

function ActiveTripContent() {
  const { tripId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showStopList, setShowStopList] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const { data: trip } = useSuspenseQuery({
    queryKey: ["driver-trip", tripId],
    queryFn: () => getDriverTrip({ data: { tripId } }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: "scheduled" | "active" | "completed" | "cancelled") =>
      updateTripStatus({ data: { tripId, status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["driver-schedule"] });
    },
  });

  const boardPassengerMutation = useMutation({
    mutationFn: ({
      bookingId,
      action,
    }: {
      bookingId: string;
      action: "board" | "drop";
    }) => updatePassengerStatus({ data: { bookingId, action } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-trip", tripId] });
    },
  });

  // Get stops from route
  const stops = trip?.route?.stops ?? [];
  const bookings = trip?.bookings ?? [];

  // Current stop based on index
  const currentStop = stops[currentStopIndex];

  // Get passengers for current stop (based on pickup stop)
  const passengersAtCurrentStop = bookings.filter(
    (b) =>
      b.pickupStop?.id === currentStop?.id ||
      (!b.pickupStop && currentStopIndex === 0)
  );

  const handleNextStop = () => {
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(currentStopIndex + 1);
    } else {
      // Trip complete
      updateStatusMutation.mutate("completed");
    }
  };

  const handleBoardPassenger = (bookingId: string, isBoarded: boolean) => {
    boardPassengerMutation.mutate({
      bookingId,
      action: isBoarded ? "drop" : "board",
    });
  };

  const isLastStop = currentStopIndex === stops.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <Link
          to="/driver/dashboard"
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{trip?.route?.name ?? "Trip"}</h1>
            <p className="text-blue-100">
              Stop {currentStopIndex + 1} of {stops.length}
            </p>
          </div>
          <StatusBadge status={trip?.status ?? "scheduled"} />
        </div>
      </div>

      {/* Map - Takes most of the screen */}
      <div className="flex-1 relative">
        <MapPlaceholder fullScreen showPins label="Navigation View" />

        {/* Navigation Button Overlay */}
        <div className="absolute bottom-4 right-4">
          <Button size="xl" className="shadow-lg">
            <Navigation className="w-6 h-6 mr-2" />
            Navigate
          </Button>
        </div>
      </div>

      {/* Bottom Sheet - Stop Info */}
      <div className="bg-white rounded-t-3xl shadow-lg -mt-6 relative z-10">
        {/* Handle */}
        <button
          onClick={() => setShowStopList(!showStopList)}
          className="w-full py-3 flex justify-center"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </button>

        {/* Current Stop */}
        <div className="px-4 pb-4">
          <Card className="border-blue-500 border-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {isLastStop ? "Final Destination" : "Current Stop"}
                </CardTitle>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {currentStop?.estimatedTime || "N/A"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {currentStop?.name ?? "Unknown Stop"}
              </h3>

              {/* Passengers at this stop */}
              {passengersAtCurrentStop.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    {passengersAtCurrentStop.length} student(s) at this stop
                  </p>
                  <div className="space-y-2">
                    {passengersAtCurrentStop.map((booking) => {
                      // Check if passenger is boarded by looking at boardedAt timestamp
                      const isBoarded = !!booking.boardedAt;
                      return (
                        <div
                          key={booking.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isBoarded
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className="font-medium">
                            {booking.student?.name ?? "Unknown"}
                          </span>
                          <Button
                            size="lg"
                            variant={isBoarded ? "secondary" : "success"}
                            className="min-w-[100px]"
                            onClick={() =>
                              handleBoardPassenger(booking.id, isBoarded)
                            }
                            disabled={boardPassengerMutation.isPending}
                          >
                            {isBoarded ? "Boarded ✓" : "Board"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Large Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Link to="/driver/incidents" search={{ tripId }}>
                  <Button size="xl" variant="outline" className="w-full h-16">
                    <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
                    Report Issue
                  </Button>
                </Link>
                <Button
                  size="xl"
                  variant="success"
                  className="h-16"
                  onClick={handleNextStop}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  {isLastStop ? "Complete Trip" : "Next Stop"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expandable Stop List */}
        {showStopList && (
          <div className="px-4 pb-4 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center justify-between">
              All Stops
              <button onClick={() => setShowStopList(false)}>
                <ChevronDown className="w-5 h-5" />
              </button>
            </h3>
            <div className="space-y-2">
              {stops.map((stop, index) => {
                const stopStatus =
                  index < currentStopIndex
                    ? "completed"
                    : index === currentStopIndex
                    ? "current"
                    : "upcoming";
                const passengersAtStop = bookings.filter(
                  (b) => b.pickupStop?.id === stop.id
                );

                return (
                  <div
                    key={stop.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      stopStatus === "current"
                        ? "bg-blue-100 border border-blue-500"
                        : stopStatus === "completed"
                        ? "bg-green-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        stopStatus === "completed"
                          ? "bg-green-500 text-white"
                          : stopStatus === "current"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {stopStatus === "completed" ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stop.name}</p>
                      <p className="text-sm text-gray-500">
                        {stop.estimatedTime || "N/A"}
                      </p>
                    </div>
                    {passengersAtStop.length > 0 && (
                      <span className="text-sm text-gray-500">
                        <Users className="w-4 h-4 inline mr-1" />
                        {passengersAtStop.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!showStopList && (
          <button
            onClick={() => setShowStopList(true)}
            className="w-full py-3 text-sm text-blue-600 flex items-center justify-center gap-1"
          >
            <ChevronUp className="w-4 h-4" />
            View all stops
          </button>
        )}
      </div>
    </div>
  );
}
