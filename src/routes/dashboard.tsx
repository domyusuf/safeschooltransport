import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookingCard,
  MapPlaceholder,
  StatusBadge,
} from "@/components/transport";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  Bus,
  MapPin,
  Clock,
  Bell,
  ArrowRight,
  Calendar,
  AlertCircle,
  User,
  Loader2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getParentBookings, getParentStudents } from "@/server";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  component: ParentDashboard,
});

function ParentDashboard() {
  const { user } = useAuth();

  // Fetch parent's bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["parentBookings"],
    queryFn: () => getParentBookings(),
    enabled: !!user,
  });

  // Fetch parent's students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["parentStudents"],
    queryFn: () => getParentStudents(),
    enabled: !!user,
  });

  const isLoading = bookingsLoading || studentsLoading;

  // Find active trip (in-progress status)
  const activeTrip = bookingsData?.upcoming?.find(
    (b) => b.trip.status === "active"
  );

  // Get upcoming rides (scheduled/confirmed)
  const upcomingRides = bookingsData?.upcoming?.slice(0, 3) || [];

  // Mock alerts for now (could be fetched from notifications endpoint)
  const mockAlerts = [
    {
      id: "1",
      message: "Welcome to Glidee! Start by adding your children.",
      time: "Just now",
      type: "info",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.name?.split(" ")[0] || "Parent";

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-gray-600">
          {students && students.length > 0
            ? "Here's what's happening with your children's transport"
            : "Get started by adding your children and booking rides"}
        </p>
      </div>

      {/* No Students CTA */}
      {students && students.length === 0 && (
        <Empty className="border-2 border-blue-300 bg-blue-50/50 py-12">
          <EmptyMedia variant="icon">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Add Your First Child</EmptyTitle>
            <EmptyDescription>
              Start by adding your children to book their school transport
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/profile">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      )}

      {/* Active Trip Card */}
      {activeTrip && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-600" />
                Active Trip
              </CardTitle>
              <StatusBadge status="in-progress" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {activeTrip.student.name}
                </p>
                <p className="text-sm text-gray-600">
                  on Bus {activeTrip.trip.vehicle?.busNumber || "N/A"} with{" "}
                  {activeTrip.trip.driver?.name || "Driver"}
                </p>
              </div>
            </div>

            <MapPlaceholder className="h-40" showPins label="Live Tracking" />

            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {activeTrip.trip.route.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Clock className="w-5 h-5" />
                <span>In Progress</span>
              </div>
            </div>

            <Link to="/rides/$rideId" params={{ rideId: activeTrip.id }}>
              <Button className="w-full" size="lg">
                View Trip Details
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/book">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Book a Ride</p>
              <p className="text-xs text-gray-500">Schedule transport</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/rides">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Bus className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900">My Rides</p>
              <p className="text-xs text-gray-500">View all trips</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              Recent Alerts
            </CardTitle>
            <Link
              to="/notifications"
              className="text-blue-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <AlertCircle
                className={`w-5 h-5 mt-0.5 ${
                  alert.type === "success" ? "text-green-500" : "text-blue-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Rides */}
      {upcomingRides.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Rides
            </h2>
            <Link to="/rides" className="text-blue-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingRides.map((booking) => (
              <BookingCard
                key={booking.id}
                id={booking.id}
                studentName={booking.student.name}
                pickupLocation={booking.pickupStop?.name || "Pickup"}
                dropoffLocation={booking.dropoffStop?.name || "Dropoff"}
                scheduledTime={`${booking.trip.date} ${booking.trip.scheduledStartTime}`}
                busNumber={booking.trip.vehicle?.busNumber || "TBD"}
                driverName={booking.trip.driver?.name || "Unassigned"}
                status={
                  booking.status as
                    | "scheduled"
                    | "confirmed"
                    | "completed"
                    | "cancelled"
                    | "in-progress"
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* No Upcoming Rides */}
      {upcomingRides.length === 0 && students && students.length > 0 && (
        <Empty className="border py-12">
          <EmptyMedia variant="icon">
            <Calendar className="w-6 h-6 text-blue-600" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No upcoming rides</EmptyTitle>
            <EmptyDescription>
              Book a ride to get your children safely to school.
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
  );
}
