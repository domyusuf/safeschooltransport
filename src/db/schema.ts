import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// ============================================
// BETTER-AUTH TABLES
// ============================================

export const userRoleEnum = ["admin", "driver", "parent"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role", { enum: userRoleEnum }).notNull().default("parent"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// ============================================
// DOMAIN TABLES
// ============================================

// Students table
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  parentId: text("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  schoolName: text("school_name").notNull(),
  grade: text("grade").notNull(),
  photoUrl: text("photo_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Vehicles table
export const vehicleStatusEnum = ["active", "maintenance"] as const;
export type VehicleStatusType = (typeof vehicleStatusEnum)[number];

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  licensePlate: text("license_plate").notNull().unique(),
  busNumber: text("bus_number").notNull(),
  capacity: integer("capacity").notNull(),
  model: text("model"),
  year: integer("year"),
  status: text("status", { enum: vehicleStatusEnum })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Routes table
export const routes = sqliteTable("routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startPoint: text("start_point").notNull(),
  endPoint: text("end_point").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Stops table
export const stops = sqliteTable("stops", {
  id: text("id").primaryKey(),
  routeId: text("route_id")
    .notNull()
    .references(() => routes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  orderIndex: integer("order_index").notNull(),
  estimatedTime: text("estimated_time"), // e.g., "08:30 AM"
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Trips table
export const tripStatusEnum = [
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const;
export type TripStatusType = (typeof tripStatusEnum)[number];

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  routeId: text("route_id")
    .notNull()
    .references(() => routes.id),
  driverId: text("driver_id").references(() => users.id),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  date: text("date").notNull(), // ISO date string: YYYY-MM-DD
  scheduledStartTime: text("scheduled_start_time"), // e.g., "07:30"
  status: text("status", { enum: tripStatusEnum })
    .notNull()
    .default("scheduled"),
  currentLat: real("current_lat"),
  currentLng: real("current_lng"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Bookings table
export const bookingStatusEnum = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export type BookingStatusType = (typeof bookingStatusEnum)[number];

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  parentId: text("parent_id")
    .notNull()
    .references(() => users.id),
  pickupStopId: text("pickup_stop_id").references(() => stops.id),
  dropoffStopId: text("dropoff_stop_id").references(() => stops.id),
  status: text("status", { enum: bookingStatusEnum })
    .notNull()
    .default("pending"),
  seatNumber: integer("seat_number"),
  boardedAt: integer("boarded_at", { mode: "timestamp" }),
  droppedAt: integer("dropped_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Incidents table
export const incidentSeverityEnum = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type IncidentSeverity = (typeof incidentSeverityEnum)[number];

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  reportedById: text("reported_by_id")
    .notNull()
    .references(() => users.id),
  description: text("description").notNull(),
  severity: text("severity", { enum: incidentSeverityEnum })
    .notNull()
    .default("low"),
  location: text("location"),
  lat: real("lat"),
  lng: real("lng"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  reportedAt: integer("reported_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  students: many(students),
  trips: many(trips),
  bookings: many(bookings),
  incidents: many(incidents),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  parent: one(users, {
    fields: [students.parentId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  trips: many(trips),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  stops: many(stops),
  trips: many(trips),
}));

export const stopsRelations = relations(stops, ({ one }) => ({
  route: one(routes, {
    fields: [stops.routeId],
    references: [routes.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  route: one(routes, {
    fields: [trips.routeId],
    references: [routes.id],
  }),
  driver: one(users, {
    fields: [trips.driverId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [trips.vehicleId],
    references: [vehicles.id],
  }),
  bookings: many(bookings),
  incidents: many(incidents),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  trip: one(trips, {
    fields: [bookings.tripId],
    references: [trips.id],
  }),
  student: one(students, {
    fields: [bookings.studentId],
    references: [students.id],
  }),
  parent: one(users, {
    fields: [bookings.parentId],
    references: [users.id],
  }),
  pickupStop: one(stops, {
    fields: [bookings.pickupStopId],
    references: [stops.id],
  }),
  dropoffStop: one(stops, {
    fields: [bookings.dropoffStopId],
    references: [stops.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  trip: one(trips, {
    fields: [incidents.tripId],
    references: [trips.id],
  }),
  reportedBy: one(users, {
    fields: [incidents.reportedById],
    references: [users.id],
  }),
}));

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type Stop = typeof stops.$inferSelect;
export type NewStop = typeof stops.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
