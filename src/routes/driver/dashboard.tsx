import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/transport";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useAuth } from "@/hooks";
import { getDriverSchedule } from "@/server/driver";
import {
  Clock,
  MapPin,
  Users,
  Bus,
  Navigation,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Coffee,
} from "lucide-react";

export const Route = createFileRoute("/driver/dashboard")({
  component: DriverDashboard,
});

function DriverDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <DriverDashboardContent />
    </Suspense>
  );
}

function DriverDashboardContent() {
  const { user } = useAuth();

  const { data: todayTrips = [] } = useSuspenseQuery({
    queryKey: ["driver-schedule"],
    queryFn: () => getDriverSchedule(),
  });

  const activeTrip = todayTrips.find((t) => t.status === "active");
  const completedTrips = todayTrips.filter(
    (t) => t.status === "completed"
  ).length;
  const totalTrips = todayTrips.length;

  // Calculate total students transported
  const studentsTransported = todayTrips
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.bookings?.length ?? 0), 0);

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.name?.split(" ")[0] ?? "Driver";

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName}! 🚌
        </h1>
        <p className="text-gray-600">
          {totalTrips > 0
            ? `You have ${totalTrips} trip${
                totalTrips > 1 ? "s" : ""
              } scheduled today`
            : "No trips scheduled for today"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {completedTrips}/{totalTrips}
            </div>
            <p className="text-sm text-gray-500">Trips Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {studentsTransported}
            </div>
            <p className="text-sm text-gray-500">Students Transported</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Trip Card - Large touch targets */}
      {activeTrip && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-600" />
                Active Trip
              </CardTitle>
              <StatusBadge status={activeTrip.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {activeTrip.route?.name ?? "Unknown Route"}
              </h3>
              <p className="text-gray-600">
                {activeTrip.scheduledStartTime || "TBD"}
              </p>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{activeTrip.route?.stops?.length ?? 0} stops</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{activeTrip.bookings?.length ?? 0} students</span>
              </div>
            </div>

            <Link to="/driver/trip/$tripId" params={{ tripId: activeTrip.id }}>
              <Button size="xl" className="w-full text-lg">
                <Navigation className="w-6 h-6 mr-2" />
                Continue Trip
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Large buttons for drivers */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/driver/incidents" search={{ tripId: activeTrip?.id }}>
          <Button
            variant="destructive"
            size="xl"
            className="w-full h-20 flex flex-col items-center justify-center"
          >
            <AlertTriangle className="w-8 h-8 mb-1" />
            <span>Report Incident</span>
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="xl"
          className="w-full h-20 flex flex-col items-center justify-center"
        >
          <CheckCircle className="w-8 h-8 mb-1" />
          <span>End Shift</span>
        </Button>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Schedule
        </h2>
        {todayTrips.length === 0 ? (
          <Empty className="border py-12">
            <EmptyMedia variant="icon">
              <Coffee className="w-6 h-6 text-amber-600" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No trips today</EmptyTitle>
              <EmptyDescription>
                You don't have any trips scheduled for today. Enjoy your day
                off!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {todayTrips.map((trip) => (
              <Card
                key={trip.id}
                className={trip.status === "active" ? "border-blue-500" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          trip.status === "completed"
                            ? "bg-green-100"
                            : trip.status === "active"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {trip.status === "completed" ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock
                            className={`w-6 h-6 ${
                              trip.status === "active"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {trip.route?.name ?? "Unknown Route"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {trip.scheduledStartTime || "TBD"} •{" "}
                          {trip.bookings?.length ?? 0} students
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  {trip.status === "scheduled" && (
                    <Link
                      to="/driver/trip/$tripId"
                      params={{ tripId: trip.id }}
                      className="block mt-4"
                    >
                      <Button size="lg" variant="outline" className="w-full">
                        Start Trip
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
