import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPlaceholder, StatusBadge } from "@/components/transport";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { getLiveMapData } from "@/server/admin";
import {
  Bus,
  Search,
  Filter,
  RefreshCw,
  Users,
  MapPin,
  Radio,
} from "lucide-react";

export const Route = createFileRoute("/admin/live-map")({
  component: LiveMapPage,
});

function LiveMapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <LiveMapContent />
    </Suspense>
  );
}

function LiveMapContent() {
  const { data: activeBuses = [] } = useSuspenseQuery({
    queryKey: ["admin-live-map"],
    queryFn: () => getLiveMapData(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Map Section */}
      <div className="flex-1 relative">
        <MapPlaceholder
          fullScreen
          showPins
          label={`Fleet Tracking - ${activeBuses.length} Active Buses`}
          className="rounded-none"
        />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button variant="secondary" size="sm" className="shadow-lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" className="shadow-lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-2">Status Legend</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Delayed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Bus List */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Active Buses
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search buses..." className="pl-9" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeBuses.length === 0 ? (
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <Radio className="w-6 h-6 text-gray-600" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No active buses</EmptyTitle>
                <EmptyDescription>
                  There are no buses currently on the road. Active trips will
                  appear here in real-time.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            activeBuses.map((bus) => (
              <Card
                key={bus.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {bus.busNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {bus.driverName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={bus.status === "active" ? "confirmed" : "pending"}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{bus.routeName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>
                        {bus.passengersCount}/{bus.totalPassengers} students
                        onboard
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeBuses.length}
              </p>
              <p className="text-xs text-gray-500">Active Trips</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {activeBuses.reduce((sum, bus) => sum + bus.passengersCount, 0)}
              </p>
              <p className="text-xs text-gray-500">Students Onboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
