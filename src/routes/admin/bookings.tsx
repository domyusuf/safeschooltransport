import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, type BookingStatus } from "@/components/transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { getBookings } from "@/server/admin";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  MapPin,
  Clock,
  Ticket,
} from "lucide-react";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

function BookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}

function BookingsContent() {
  const { data: allBookings = [] } = useSuspenseQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => getBookings({ data: {} }),
  });

  const pendingBookings = allBookings.filter((b) => b.status === "pending");
  const confirmedBookings = allBookings.filter((b) => b.status === "confirmed");
  const completedBookings = allBookings.filter((b) => b.status === "completed");

  const BookingsTable = ({ bookings }: { bookings: typeof allBookings }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b">
            <th className="pb-3 font-medium">Booking ID</th>
            <th className="pb-3 font-medium">Student</th>
            <th className="pb-3 font-medium">Parent</th>
            <th className="pb-3 font-medium">Route</th>
            <th className="pb-3 font-medium">Pickup</th>
            <th className="pb-3 font-medium">Time</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <td className="py-4 font-mono text-sm text-gray-600">
                {booking.id.slice(0, 8)}
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {booking.student?.name ?? "Unknown"}
                  </span>
                </div>
              </td>
              <td className="py-4 text-gray-600">
                {booking.parent?.name ?? "Unknown"}
              </td>
              <td className="py-4 text-gray-600">
                {booking.trip?.route?.name ?? "N/A"}
              </td>
              <td className="py-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="truncate max-w-[150px]">
                    {booking.pickupStop?.name ?? "N/A"}
                  </span>
                </div>
              </td>
              <td className="py-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {booking.trip?.scheduledStartTime ?? "TBD"}
                </div>
              </td>
              <td className="py-4">
                <StatusBadge status={booking.status as BookingStatus} />
              </td>
              <td className="py-4">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bookings.length === 0 && (
        <Empty className="py-16">
          <EmptyMedia variant="icon">
            <Ticket className="w-6 h-6 text-blue-600" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No bookings found</EmptyTitle>
            <EmptyDescription>
              There are no bookings in this category yet. Bookings will appear
              here once parents start booking rides.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Booking
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage all transport bookings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by student, parent, or booking ID..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {allBookings.length}
            </p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {pendingBookings.length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {confirmedBookings.length}
            </p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-600">
              {completedBookings.length}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table with Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-6 pt-4">
              <TabsList>
                <TabsTrigger value="all">
                  All ({allBookings.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedBookings.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedBookings.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="all" className="mt-0">
                <BookingsTable bookings={allBookings} />
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                <BookingsTable bookings={pendingBookings} />
              </TabsContent>
              <TabsContent value="confirmed" className="mt-0">
                <BookingsTable bookings={confirmedBookings} />
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                <BookingsTable bookings={completedBookings} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
