import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/db";
import {
  students,
  routes,
  trips,
  bookings,
  users,
  type NewStudent,
  type NewBooking,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-middleware";

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const addStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  schoolName: z.string().min(2, "School name is required"),
  grade: z.string().min(1, "Grade is required"),
  photoUrl: z.string().url().optional().nullable(),
});

const createBookingSchema = z.object({
  tripId: z.string().uuid(),
  studentId: z.string().uuid(),
  pickupStopId: z.string().uuid().optional(),
  dropoffStopId: z.string().uuid().optional(),
});

const getAvailableRoutesSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

// ===========================================
// PARENT/STUDENT SERVER FUNCTIONS
// ===========================================

/**
 * Add a new student linked to the logged-in parent
 */
export const addStudent = createServerFn({ method: "POST" })
  .inputValidator(addStudentSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const studentId = crypto.randomUUID();
    const newStudent: NewStudent = {
      id: studentId,
      parentId: session.user.id,
      name: data.name,
      schoolName: data.schoolName,
      grade: data.grade,
      photoUrl: data.photoUrl ?? null,
    };

    await db.insert(students).values(newStudent);

    return { success: true, studentId };
  });

/**
 * Get all students for the logged-in parent
 */
export const getParentStudents = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const result = await db.query.students.findMany({
      where: eq(students.parentId, session.user.id),
    });

    return result;
  }
);

/**
 * Get available routes with trips for a specific date
 */
export const getAvailableRoutes = createServerFn({ method: "GET" })
  .inputValidator(getAvailableRoutesSchema)
  .handler(async ({ data }) => {
    const result = await db.query.routes.findMany({
      where: eq(routes.isActive, true),
      with: {
        stops: {
          orderBy: (stops, { asc }) => [asc(stops.orderIndex)],
        },
        trips: {
          where: and(eq(trips.date, data.date), eq(trips.status, "scheduled")),
          with: {
            vehicle: true,
            driver: true,
            bookings: true,
          },
        },
      },
    });

    // Calculate available seats for each trip
    const routesWithAvailability = result.map((route) => ({
      ...route,
      trips: route.trips.map((trip) => {
        const bookedSeats = trip.bookings.filter(
          (b) => b.status !== "cancelled"
        ).length;
        const capacity = trip.vehicle?.capacity ?? 0;
        const availableSeats = Math.max(0, capacity - bookedSeats);

        return {
          ...trip,
          bookedSeats,
          availableSeats,
          isFull: availableSeats === 0,
        };
      }),
    }));

    return routesWithAvailability;
  });

/**
 * Create a booking (transactional)
 * Checks seat availability -> Creates Booking -> Returns success/failure
 */
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator(createBookingSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Verify student belongs to parent
    const student = await db.query.students.findFirst({
      where: and(
        eq(students.id, data.studentId),
        eq(students.parentId, session.user.id)
      ),
    });

    if (!student) {
      throw new Error("Student not found or does not belong to you");
    }

    // Get trip with vehicle and current bookings
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, data.tripId),
      with: {
        vehicle: true,
        bookings: {
          where: (bookings, { ne }) => ne(bookings.status, "cancelled"),
        },
      },
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.status !== "scheduled") {
      throw new Error("Trip is not available for booking");
    }

    // Check seat availability
    const bookedSeats = trip.bookings.length;
    const capacity = trip.vehicle?.capacity ?? 0;

    if (bookedSeats >= capacity) {
      throw new Error("No seats available on this trip");
    }

    // Check if student already has a booking on this trip
    const existingBooking = trip.bookings.find(
      (b) => b.studentId === data.studentId
    );
    if (existingBooking) {
      throw new Error("Student already has a booking on this trip");
    }

    // Create the booking
    const bookingId = crypto.randomUUID();
    const seatNumber = bookedSeats + 1;

    const newBooking: NewBooking = {
      id: bookingId,
      tripId: data.tripId,
      studentId: data.studentId,
      parentId: session.user.id,
      pickupStopId: data.pickupStopId ?? null,
      dropoffStopId: data.dropoffStopId ?? null,
      status: "confirmed",
      seatNumber,
    };

    await db.insert(bookings).values(newBooking);

    return {
      success: true,
      bookingId,
      seatNumber,
      message: "Booking confirmed successfully",
    };
  });

/**
 * Get all bookings for the logged-in parent's children
 */
export const getParentBookings = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    const today = new Date().toISOString().split("T")[0];

    const result = await db.query.bookings.findMany({
      where: eq(bookings.parentId, session.user.id),
      with: {
        student: true,
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

    // Separate into upcoming and past bookings
    const upcomingBookings = result.filter(
      (b) => b.trip.date >= today && b.status !== "cancelled"
    );
    const pastBookings = result.filter(
      (b) => b.trip.date < today || b.status === "completed"
    );

    return {
      upcoming: upcomingBookings,
      past: pastBookings,
      all: result,
    };
  }
);

/**
 * Cancel a booking
 */
export const cancelBooking = createServerFn({ method: "POST" })
  .inputValidator(z.object({ bookingId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { bookingId } = data;
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    // Verify booking belongs to parent
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.parentId, session.user.id)
      ),
      with: {
        trip: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    if (
      booking.trip.status === "active" ||
      booking.trip.status === "completed"
    ) {
      throw new Error("Cannot cancel booking for an active or completed trip");
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    return { success: true, message: "Booking cancelled successfully" };
  });

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url().optional().or(z.literal("")),
});

/**
 * Update user profile
 */
export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }

    await db
      .update(users)
      .set({
        name: data.name,
        image: data.image || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true };
  });
