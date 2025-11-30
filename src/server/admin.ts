import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/db";
import {
  routes,
  stops,
  trips,
  bookings,
  vehicles,
  users,
  type NewRoute,
  type NewStop,
  type NewTrip,
  type NewVehicle,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-middleware";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const stopSchema = z.object({
  name: z.string().min(2),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  orderIndex: z.number().int().min(0),
  estimatedTime: z.string().optional(),
});

const createRouteSchema = z.object({
  name: z.string().min(2, "Route name is required"),
  startPoint: z.string().min(2, "Start point is required"),
  endPoint: z.string().min(2, "End point is required"),
  estimatedDuration: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute"),
  stops: z.array(stopSchema).min(2, "Route must have at least 2 stops"),
});

const assignDriverSchema = z.object({
  tripId: z.string().uuid(),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
});

const createTripSchema = z.object({
  routeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

const createVehicleSchema = z.object({
  licensePlate: z.string().min(2),
  busNumber: z.string().min(1),
  capacity: z.number().int().min(1),
  model: z.string().optional(),
  year: z.number().int().min(1990).max(2030).optional(),
});

const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

// ===========================================
// ADMIN HELPER: Check admin role
// ===========================================

async function requireAdmin() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Please sign in");
  }

  const userRole = (session.user as { role?: string }).role;
  if (userRole !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}

// ===========================================
// ADMIN SERVER FUNCTIONS
// ===========================================

/**
 * Create a route with stops in a batch
 */
export const createRoute = createServerFn({ method: "POST" })
  .inputValidator(createRouteSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    const routeId = crypto.randomUUID();

    // Create route
    const newRoute: NewRoute = {
      id: routeId,
      name: data.name,
      startPoint: data.startPoint,
      endPoint: data.endPoint,
      estimatedDuration: data.estimatedDuration,
      isActive: true,
    };

    await db.insert(routes).values(newRoute);

    // Create stops
    const stopsData: NewStop[] = data.stops.map((stop) => ({
      id: crypto.randomUUID(),
      routeId,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      orderIndex: stop.orderIndex,
      estimatedTime: stop.estimatedTime ?? null,
    }));

    await db.insert(stops).values(stopsData);

    return { success: true, routeId, stopsCount: stopsData.length };
  });

/**
 * Get all routes with stops
 */
export const getRoutes = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const result = await db.query.routes.findMany({
    with: {
      stops: {
        orderBy: (stops, { asc }) => [asc(stops.orderIndex)],
      },
    },
    orderBy: (routes, { asc }) => [asc(routes.name)],
  });

  return result;
});

/**
 * Create a trip for a route
 */
export const createTrip = createServerFn({ method: "POST" })
  .inputValidator(createTripSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    const tripId = crypto.randomUUID();

    const newTrip: NewTrip = {
      id: tripId,
      routeId: data.routeId,
      date: data.date,
      scheduledStartTime: data.scheduledStartTime,
      driverId: data.driverId ?? null,
      vehicleId: data.vehicleId ?? null,
      status: "scheduled",
    };

    await db.insert(trips).values(newTrip);

    return { success: true, tripId };
  });

/**
 * Assign driver and vehicle to a trip
 */
export const assignDriver = createServerFn({ method: "POST" })
  .inputValidator(assignDriverSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    // Verify driver exists and has driver role
    const driver = await db.query.users.findFirst({
      where: eq(users.id, data.driverId),
    });

    if (!driver) {
      throw new Error("Driver not found");
    }

    if (driver.role !== "driver") {
      throw new Error("User is not a driver");
    }

    // Verify vehicle exists
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.id, data.vehicleId),
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    if (vehicle.status !== "active") {
      throw new Error("Vehicle is not active");
    }

    // Update trip
    await db
      .update(trips)
      .set({
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, data.tripId));

    return { success: true };
  });

/**
 * Get fleet status and stats
 */
export const getFleetStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();

    const today = new Date().toISOString().split("T")[0];

    // Get all vehicles
    const allVehicles = await db.query.vehicles.findMany({
      with: {
        trips: {
          where: eq(trips.date, today),
        },
      },
    });

    // Get today's trips
    const todayTrips = await db.query.trips.findMany({
      where: eq(trips.date, today),
      with: {
        route: true,
        driver: true,
        vehicle: true,
        bookings: true,
      },
    });

    // Calculate stats
    const activeTrips = todayTrips.filter((t) => t.status === "active").length;
    const scheduledTrips = todayTrips.filter(
      (t) => t.status === "scheduled"
    ).length;
    const completedTrips = todayTrips.filter(
      (t) => t.status === "completed"
    ).length;
    const activeVehicles = allVehicles.filter(
      (v) => v.status === "active"
    ).length;
    const maintenanceVehicles = allVehicles.filter(
      (v) => v.status === "maintenance"
    ).length;
    const totalBookings = todayTrips.reduce(
      (acc, t) => acc + t.bookings.length,
      0
    );

    // Get recent incidents
    const recentIncidents = await db.query.incidents.findMany({
      orderBy: (incidents, { desc }) => [desc(incidents.reportedAt)],
      limit: 5,
      with: {
        trip: {
          with: {
            route: true,
          },
        },
        reportedBy: true,
      },
    });

    return {
      stats: {
        activeTrips,
        scheduledTrips,
        completedTrips,
        totalTripsToday: todayTrips.length,
        activeVehicles,
        maintenanceVehicles,
        totalVehicles: allVehicles.length,
        totalBookingsToday: totalBookings,
      },
      todayTrips,
      vehicles: allVehicles,
      recentIncidents,
    };
  }
);

/**
 * Get all bookings with filters
 */
export const getBookings = createServerFn({ method: "GET" })
  .inputValidator(z.object({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    const { status } = data;
    await requireAdmin();

    const result = await db.query.bookings.findMany({
      with: {
        student: true,
        parent: true,
        trip: {
          with: {
            route: true,
            vehicle: true,
            driver: true,
          },
        },
        pickupStop: true,
        dropoffStop: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    if (status) {
      return result.filter((b) => b.status === status);
    }

    return result;
  });

/**
 * Update booking status
 */
export const updateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator(updateBookingStatusSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    await db
      .update(bookings)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(bookings.id, data.bookingId));

    return { success: true };
  });

/**
 * Create a vehicle
 */
export const createVehicle = createServerFn({ method: "POST" })
  .inputValidator(createVehicleSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    const vehicleId = crypto.randomUUID();

    const newVehicle: NewVehicle = {
      id: vehicleId,
      licensePlate: data.licensePlate,
      busNumber: data.busNumber,
      capacity: data.capacity,
      model: data.model ?? null,
      year: data.year ?? null,
      status: "active",
    };

    await db.insert(vehicles).values(newVehicle);

    return { success: true, vehicleId };
  });

/**
 * Get all vehicles
 */
export const getVehicles = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();

    const result = await db.query.vehicles.findMany({
      orderBy: (vehicles, { asc }) => [asc(vehicles.busNumber)],
    });

    return result;
  }
);

/**
 * Update vehicle status
 */
const updateVehicleStatusSchema = z.object({
  vehicleId: z.string().uuid(),
  status: z.enum(["active", "maintenance"]),
});

export const updateVehicleStatus = createServerFn({ method: "POST" })
  .inputValidator(updateVehicleStatusSchema)
  .handler(async ({ data }) => {
    await requireAdmin();

    await db
      .update(vehicles)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(vehicles.id, data.vehicleId));

    return { success: true };
  });

/**
 * Get all drivers
 */
export const getDrivers = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();

    const result = await db.query.users.findMany({
      where: eq(users.role, "driver"),
    });

    return result;
  }
);

/**
 * Get live map data (all active trips with locations)
 */
export const getLiveMapData = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin();

    const today = new Date().toISOString().split("T")[0];

    const activeTrips = await db.query.trips.findMany({
      where: and(eq(trips.date, today), eq(trips.status, "active")),
      with: {
        route: true,
        driver: true,
        vehicle: true,
        bookings: {
          with: {
            student: true,
          },
        },
      },
    });

    return activeTrips.map((trip) => ({
      id: trip.id,
      busNumber: trip.vehicle?.busNumber ?? "Unknown",
      driverName: trip.driver?.name ?? "Unassigned",
      routeName: trip.route.name,
      status: trip.status,
      lat: trip.currentLat,
      lng: trip.currentLng,
      passengersCount: trip.bookings.filter((b) => b.boardedAt && !b.droppedAt)
        .length,
      totalPassengers: trip.bookings.length,
    }));
  }
);
