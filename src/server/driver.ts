import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/db";
import {
  trips,
  bookings,
  incidents,
  type TripStatusType,
  type NewIncident,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-middleware";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateTripStatusSchema = z.object({
  tripId: z.string().uuid(),
  status: z.enum(["scheduled", "active", "completed", "cancelled"]),
});

const updateLocationSchema = z.object({
  tripId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const reportIncidentSchema = z.object({
  tripId: z.string().uuid(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

const boardPassengerSchema = z.object({
  bookingId: z.string().uuid(),
  action: z.enum(["board", "drop"]),
});

// ===========================================
// DRIVER SERVER FUNCTIONS
// ===========================================

/**
 * Get today's schedule for the logged-in driver
 */
export const getDriverSchedule = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const today = new Date().toISOString().split("T")[0];

    const result = await db.query.trips.findMany({
      where: and(eq(trips.driverId, session.user.id), eq(trips.date, today)),
      with: {
        route: {
          with: {
            stops: {
              orderBy: (stops, { asc }) => [asc(stops.orderIndex)],
            },
          },
        },
        vehicle: true,
        bookings: {
          with: {
            student: true,
            pickupStop: true,
            dropoffStop: true,
          },
        },
      },
      orderBy: (trips, { asc }) => [asc(trips.scheduledStartTime)],
    });

    return result;
  }
);

/**
 * Get a specific trip details for the driver
 */
export const getDriverTrip = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tripId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { tripId } = data;
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.driverId, session.user.id)),
      with: {
        route: {
          with: {
            stops: {
              orderBy: (stops, { asc }) => [asc(stops.orderIndex)],
            },
          },
        },
        vehicle: true,
        bookings: {
          with: {
            student: true,
            pickupStop: true,
            dropoffStop: true,
          },
        },
        incidents: true,
      },
    });

    if (!trip) {
      throw new Error("Trip not found or not assigned to you");
    }

    return trip;
  });

/**
 * Update trip status (e.g., from 'scheduled' to 'active')
 */
export const updateTripStatus = createServerFn({ method: "POST" })
  .inputValidator(updateTripStatusSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Verify trip belongs to driver
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, data.tripId),
        eq(trips.driverId, session.user.id)
      ),
    });

    if (!trip) {
      throw new Error("Trip not found or not assigned to you");
    }

    // Validate status transitions
    const validTransitions: Record<TripStatusType, TripStatusType[]> = {
      scheduled: ["active", "cancelled"],
      active: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[trip.status].includes(data.status)) {
      throw new Error(
        `Cannot transition from ${trip.status} to ${data.status}`
      );
    }

    const updateData: Partial<typeof trips.$inferSelect> = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.status === "active") {
      updateData.startedAt = new Date();
    } else if (data.status === "completed") {
      updateData.completedAt = new Date();
    }

    await db.update(trips).set(updateData).where(eq(trips.id, data.tripId));

    // If completing trip, mark all confirmed bookings as completed
    if (data.status === "completed") {
      await db
        .update(bookings)
        .set({ status: "completed", updatedAt: new Date() })
        .where(
          and(
            eq(bookings.tripId, data.tripId),
            eq(bookings.status, "confirmed")
          )
        );
    }

    return { success: true, status: data.status };
  });

/**
 * Update current location (Mock GPS)
 */
export const updateLocation = createServerFn({ method: "POST" })
  .inputValidator(updateLocationSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Verify trip belongs to driver and is active
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, data.tripId),
        eq(trips.driverId, session.user.id)
      ),
    });

    if (!trip) {
      throw new Error("Trip not found or not assigned to you");
    }

    if (trip.status !== "active") {
      throw new Error("Can only update location for active trips");
    }

    await db
      .update(trips)
      .set({
        currentLat: data.lat,
        currentLng: data.lng,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, data.tripId));

    return { success: true, lat: data.lat, lng: data.lng };
  });

/**
 * Report an incident
 */
export const reportIncident = createServerFn({ method: "POST" })
  .inputValidator(reportIncidentSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Verify trip belongs to driver
    const trip = await db.query.trips.findFirst({
      where: and(
        eq(trips.id, data.tripId),
        eq(trips.driverId, session.user.id)
      ),
    });

    if (!trip) {
      throw new Error("Trip not found or not assigned to you");
    }

    const incidentId = crypto.randomUUID();
    const newIncident: NewIncident = {
      id: incidentId,
      tripId: data.tripId,
      reportedById: session.user.id,
      description: data.description,
      severity: data.severity,
      location: data.location ?? null,
      lat: data.lat ?? trip.currentLat ?? null,
      lng: data.lng ?? trip.currentLng ?? null,
    };

    await db.insert(incidents).values(newIncident);

    return { success: true, incidentId };
  });

/**
 * Board or drop a passenger
 */
export const updatePassengerStatus = createServerFn({ method: "POST" })
  .inputValidator(boardPassengerSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Get booking with trip
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, data.bookingId),
      with: {
        trip: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify trip belongs to driver
    if (booking.trip.driverId !== session.user.id) {
      throw new Error("You are not assigned to this trip");
    }

    if (booking.trip.status !== "active") {
      throw new Error("Trip must be active to update passenger status");
    }

    const updateData: Partial<typeof bookings.$inferSelect> = {
      updatedAt: new Date(),
    };

    if (data.action === "board") {
      if (booking.boardedAt) {
        throw new Error("Passenger already boarded");
      }
      updateData.boardedAt = new Date();
    } else if (data.action === "drop") {
      if (!booking.boardedAt) {
        throw new Error("Passenger must be boarded first");
      }
      if (booking.droppedAt) {
        throw new Error("Passenger already dropped off");
      }
      updateData.droppedAt = new Date();
    }

    await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, data.bookingId));

    return { success: true, action: data.action };
  });

/**
 * Get driver's incidents for today
 */
export const getDriverIncidents = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const result = await db.query.incidents.findMany({
      where: eq(incidents.reportedById, session.user.id),
      with: {
        trip: {
          with: {
            route: true,
          },
        },
      },
      orderBy: (incidents, { desc }) => [desc(incidents.reportedAt)],
      limit: 50,
    });

    return result;
  }
);
