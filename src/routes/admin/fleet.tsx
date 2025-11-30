import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/transport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { getVehicles, getDrivers } from "@/server/admin";
import {
  Search,
  Plus,
  Bus,
  Users,
  Phone,
  Mail,
  Star,
  MoreHorizontal,
  Wrench,
  Shield,
  UserPlus,
} from "lucide-react";

export const Route = createFileRoute("/admin/fleet")({ component: FleetPage });

function FleetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <FleetContent />
    </Suspense>
  );
}

function FleetContent() {
  const { data: vehiclesRaw = [] } = useSuspenseQuery({
    queryKey: ["admin-vehicles"],
    queryFn: () => getVehicles(),
  });
  const vehicles = vehiclesRaw as any[];

  const { data: driversRaw = [] } = useSuspenseQuery({
    queryKey: ["admin-drivers"],
    queryFn: () => getDrivers(),
  });
  const drivers = driversRaw as any[];

  const activeVehicles = vehicles.filter((v) => v.status === "active");
  const activeDrivers = drivers.filter((d) => d.role === "driver");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet & Drivers</h1>
          <p className="text-gray-600">
            Manage vehicles and driver assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {vehicles.length}
            </p>
            <p className="text-sm text-gray-500">Total Vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {activeVehicles.length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
            <p className="text-sm text-gray-500">Total Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {activeDrivers.length}
            </p>
            <p className="text-sm text-gray-500">On Duty</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Bus className="w-4 h-4" />
            Vehicles ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Drivers ({drivers.length})
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>All Vehicles</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search vehicles..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3 font-medium">Bus Number</th>
                      <th className="pb-3 font-medium">Model</th>
                      <th className="pb-3 font-medium">Capacity</th>
                      <th className="pb-3 font-medium">Assigned Driver</th>
                      <th className="pb-3 font-medium">Maintenance</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Bus className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {vehicle.busNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {vehicle.licensePlate}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">
                          <p>{vehicle.model}</p>
                          <p className="text-sm text-gray-500">
                            {vehicle.year}
                          </p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            {vehicle.capacity}
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">
                          {vehicle.assignedDriver || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Wrench className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {vehicle.nextMaintenance}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={vehicle.status} />
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
              </div>
              {vehicles.length === 0 && (
                <Empty className="py-16">
                  <EmptyMedia variant="icon">
                    <Bus className="w-6 h-6 text-yellow-600" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No vehicles in fleet</EmptyTitle>
                    <EmptyDescription>
                      Start building your fleet by adding your first vehicle.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>All Drivers</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search drivers..." className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map((driver) => (
                  <Card
                    key={driver.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={driver.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {driver.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {driver.name}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              {driver.rating}
                            </div>
                          </div>
                        </div>
                        <StatusBadge
                          status={
                            driver.status === "active"
                              ? "confirmed"
                              : driver.status === "on-leave"
                              ? "pending"
                              : "cancelled"
                          }
                        />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {driver.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {driver.phone}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bus className="w-4 h-4 text-gray-400" />
                          {driver.assignedBus || "No assignment"}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Shield className="w-4 h-4 text-gray-400" />
                          License: {driver.licenseExpiry}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {driver.totalTrips} trips completed
                        </span>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {drivers.length === 0 && (
                <Empty className="py-16">
                  <EmptyMedia variant="icon">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No drivers registered</EmptyTitle>
                    <EmptyDescription>
                      Add drivers to your team to start assigning them to
                      routes.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Driver
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
