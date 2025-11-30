import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/transport";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { getFleetStatus, getBookings } from "@/server/admin";
import {
  Bus,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ArrowUpRight,
  Ticket,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const { data: fleetData } = useSuspenseQuery({
    queryKey: ["admin-fleet-status"],
    queryFn: () => getFleetStatus(),
  });

  const { data: allBookings = [] } = useSuspenseQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => getBookings({ data: {} }),
  });

  const stats = fleetData?.stats ?? {
    activeTrips: 0,
    scheduledTrips: 0,
    completedTrips: 0,
    totalTripsToday: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    totalVehicles: 0,
    totalBookingsToday: 0,
  };

  const recentIncidents = fleetData?.recentIncidents ?? [];
  const recentBookings = allBookings.slice(0, 5);

  // Calculate fleet utilization
  const fleetUtilization =
    stats.totalVehicles > 0
      ? Math.round((stats.activeVehicles / stats.totalVehicles) * 100)
      : 0;
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your school transport system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Buses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeVehicles}
                  <span className="text-lg text-gray-400">
                    /{stats.totalVehicles}
                  </span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {fleetUtilization}%
              </span>
              <span className="text-gray-500 ml-2">fleet utilization</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBookingsToday}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.totalTripsToday}
              </span>
              <span className="text-gray-500 ml-2">trips scheduled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Trips</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
              </span>
              <span className="text-gray-500">
                {stats.completedTrips} completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.scheduledTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.maintenanceVehicles}
              </span>
              <span className="text-gray-500 ml-2">
                vehicles in maintenance
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Link
              to="/admin/bookings"
              className="text-sm text-blue-600 hover:underline flex items-center"
            >
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Route</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8">
                        <Empty>
                          <EmptyMedia variant="icon">
                            <Ticket className="w-5 h-5 text-gray-600" />
                          </EmptyMedia>
                          <EmptyHeader>
                            <EmptyTitle className="text-base">
                              No recent bookings
                            </EmptyTitle>
                            <EmptyDescription>
                              Bookings will appear here once parents start
                              booking rides.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-4 font-medium text-gray-900">
                          {booking.student?.name ?? "Unknown"}
                        </td>
                        <td className="py-4 text-gray-600">
                          {booking.trip?.route?.name ?? "N/A"}
                        </td>
                        <td className="py-4 text-gray-600">
                          {booking.trip?.scheduledStartTime ?? "TBD"}
                        </td>
                        <td className="py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Incidents</CardTitle>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              {
                recentIncidents.filter(
                  (i) => i.severity === "high" || i.severity === "critical"
                ).length
              }{" "}
              high priority
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentIncidents.length === 0 ? (
                <Empty className="py-6">
                  <EmptyMedia variant="icon">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle className="text-base">All clear!</EmptyTitle>
                    <EmptyDescription>
                      No incidents reported. Keep up the great work!
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                recentIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        incident.severity === "critical" ||
                        incident.severity === "high"
                          ? "bg-red-100"
                          : incident.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {incident.severity === "critical" ||
                      incident.severity === "high" ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : incident.severity === "medium" ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {incident.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {incident.trip?.route?.name ?? "Unknown route"} •{" "}
                        {incident.severity}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link to="/admin/live-map">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Live Fleet Map</p>
                <p className="text-sm text-gray-500">
                  Track all buses in real-time
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/routes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Manage Routes</p>
                <p className="text-sm text-gray-500">Edit routes and stops</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/fleet">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Fleet & Drivers</p>
                <p className="text-sm text-gray-500">
                  Manage vehicles and staff
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
