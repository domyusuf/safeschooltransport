import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPlaceholder, StatusBadge } from "@/components/transport";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { getRoutes } from "@/server/admin";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  MoreHorizontal,
  Route as RouteIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/routes")({
  component: RoutesPage,
});

function RoutesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <RoutesContent />
    </Suspense>
  );
}

function RoutesContent() {
  const { data: routes = [] } = useSuspenseQuery({
    queryKey: ["admin-routes"],
    queryFn: () => getRoutes(),
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    routes[0]?.id ?? null
  );

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-600">Manage transport routes and stops</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Route
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search routes..." className="pl-9" />
          </div>

          <div className="space-y-3">
            {routes.length === 0 ? (
              <Empty className="border py-12">
                <EmptyMedia variant="icon">
                  <RouteIcon className="w-6 h-6 text-blue-600" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No routes yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first route to start managing transport.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Route
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              routes.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoute?.id === route.id
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {route.name}
                      </h3>
                      <StatusBadge
                        status={route.isActive ? "confirmed" : "cancelled"}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {route.startPoint} → {route.endPoint}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {route.stops.length} stops
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {route.estimatedDuration} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Route Details */}
        <div className="lg:col-span-2">
          {selectedRoute ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedRoute.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRoute.startPoint} → {selectedRoute.endPoint}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Map */}
                <MapPlaceholder
                  showPins
                  label={`Route Map - ${selectedRoute.stops.length} Stops`}
                />

                {/* Route Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedRoute.stops.length}
                      </p>
                      <p className="text-sm text-gray-500">Stops</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedRoute.estimatedDuration} min
                      </p>
                      <p className="text-sm text-gray-500">Duration</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Stops List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Stops</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stop
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {selectedRoute.stops.map((stop, index) => (
                      <div
                        key={stop.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {stop.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {stop.estimatedTime ?? "No time set"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Route
                </h3>
                <p className="text-gray-500">
                  Choose a route from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
