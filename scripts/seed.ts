import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/db/schema";

const client = createClient({ url: "file:./sqlite.db" });
const db = drizzle(client, { schema });

// Simple password hashing for demo (use bcrypt or argon2 in production)
function simpleHash(password: string): string {
  // This is a placeholder - better-auth handles actual password hashing
  return `hashed_${password}`;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Create test users with different roles
  const adminId = crypto.randomUUID();
  const driverId = crypto.randomUUID();
  const driver2Id = crypto.randomUUID();
  const parentId = crypto.randomUUID();
  const parent2Id = crypto.randomUUID();

  // Hash passwords
  const passwordHash = simpleHash("password123");

  // Insert users
  await db.insert(schema.users).values([
    {
      id: adminId,
      name: "Admin User",
      email: "admin@glidee.com",
      role: "admin",
      emailVerified: true,
    },
    {
      id: driverId,
      name: "Michael Driver",
      email: "driver@glidee.com",
      role: "driver",
      emailVerified: true,
    },
    {
      id: driver2Id,
      name: "Sarah Wilson",
      email: "driver2@glidee.com",
      role: "driver",
      emailVerified: true,
    },
    {
      id: parentId,
      name: "Sarah Johnson",
      email: "parent@glidee.com",
      role: "parent",
      emailVerified: true,
    },
    {
      id: parent2Id,
      name: "John Smith",
      email: "parent2@glidee.com",
      role: "parent",
      emailVerified: true,
    },
  ]);

  // Create accounts with passwords
  await db.insert(schema.accounts).values([
    {
      id: crypto.randomUUID(),
      userId: adminId,
      accountId: adminId,
      providerId: "credential",
      password: passwordHash,
    },
    {
      id: crypto.randomUUID(),
      userId: driverId,
      accountId: driverId,
      providerId: "credential",
      password: passwordHash,
    },
    {
      id: crypto.randomUUID(),
      userId: driver2Id,
      accountId: driver2Id,
      providerId: "credential",
      password: passwordHash,
    },
    {
      id: crypto.randomUUID(),
      userId: parentId,
      accountId: parentId,
      providerId: "credential",
      password: passwordHash,
    },
    {
      id: crypto.randomUUID(),
      userId: parent2Id,
      accountId: parent2Id,
      providerId: "credential",
      password: passwordHash,
    },
  ]);

  console.log("✅ Users created");

  // Create students
  const student1Id = crypto.randomUUID();
  const student2Id = crypto.randomUUID();
  const student3Id = crypto.randomUUID();

  await db.insert(schema.students).values([
    {
      id: student1Id,
      parentId,
      name: "Emma Johnson",
      schoolName: "Lincoln High School",
      grade: "10th",
    },
    {
      id: student2Id,
      parentId,
      name: "Liam Johnson",
      schoolName: "Maple Elementary",
      grade: "5th",
    },
    {
      id: student3Id,
      parentId: parent2Id,
      name: "Olivia Smith",
      schoolName: "Lincoln High School",
      grade: "11th",
    },
  ]);

  console.log("✅ Students created");

  // Create vehicles
  const vehicle1Id = crypto.randomUUID();
  const vehicle2Id = crypto.randomUUID();
  const vehicle3Id = crypto.randomUUID();

  await db.insert(schema.vehicles).values([
    {
      id: vehicle1Id,
      licensePlate: "SCH-001",
      busNumber: "Bus 42",
      capacity: 30,
      model: "Blue Bird Vision",
      year: 2022,
      status: "active",
    },
    {
      id: vehicle2Id,
      licensePlate: "SCH-002",
      busNumber: "Bus 15",
      capacity: 25,
      model: "Thomas C2",
      year: 2021,
      status: "active",
    },
    {
      id: vehicle3Id,
      licensePlate: "SCH-003",
      busNumber: "Bus 7",
      capacity: 35,
      model: "IC Bus CE",
      year: 2020,
      status: "maintenance",
    },
  ]);

  console.log("✅ Vehicles created");

  // Create routes
  const route1Id = crypto.randomUUID();
  const route2Id = crypto.randomUUID();

  await db.insert(schema.routes).values([
    {
      id: route1Id,
      name: "Morning Route A",
      startPoint: "Downtown Terminal",
      endPoint: "Lincoln High School",
      estimatedDuration: 45,
      isActive: true,
    },
    {
      id: route2Id,
      name: "Morning Route B",
      startPoint: "Westside Hub",
      endPoint: "Maple Elementary",
      estimatedDuration: 35,
      isActive: true,
    },
  ]);

  console.log("✅ Routes created");

  // Create stops for Route A
  const stop1Id = crypto.randomUUID();
  const stop2Id = crypto.randomUUID();
  const stop3Id = crypto.randomUUID();
  const stop4Id = crypto.randomUUID();

  await db.insert(schema.stops).values([
    {
      id: stop1Id,
      routeId: route1Id,
      name: "Downtown Terminal",
      lat: 39.7392,
      lng: -104.9903,
      orderIndex: 0,
      estimatedTime: "07:30",
    },
    {
      id: stop2Id,
      routeId: route1Id,
      name: "123 Oak Street",
      lat: 39.742,
      lng: -104.985,
      orderIndex: 1,
      estimatedTime: "07:45",
    },
    {
      id: stop3Id,
      routeId: route1Id,
      name: "Main St & 5th Ave",
      lat: 39.745,
      lng: -104.98,
      orderIndex: 2,
      estimatedTime: "08:00",
    },
    {
      id: stop4Id,
      routeId: route1Id,
      name: "Lincoln High School",
      lat: 39.75,
      lng: -104.975,
      orderIndex: 3,
      estimatedTime: "08:15",
    },
  ]);

  // Create stops for Route B
  const stop5Id = crypto.randomUUID();
  const stop6Id = crypto.randomUUID();
  const stop7Id = crypto.randomUUID();

  await db.insert(schema.stops).values([
    {
      id: stop5Id,
      routeId: route2Id,
      name: "Westside Hub",
      lat: 39.73,
      lng: -105.0,
      orderIndex: 0,
      estimatedTime: "08:00",
    },
    {
      id: stop6Id,
      routeId: route2Id,
      name: "Pine Street Stop",
      lat: 39.735,
      lng: -104.995,
      orderIndex: 1,
      estimatedTime: "08:15",
    },
    {
      id: stop7Id,
      routeId: route2Id,
      name: "Maple Elementary",
      lat: 39.74,
      lng: -104.99,
      orderIndex: 2,
      estimatedTime: "08:30",
    },
  ]);

  console.log("✅ Stops created");

  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Create trips
  const trip1Id = crypto.randomUUID();
  const trip2Id = crypto.randomUUID();
  const trip3Id = crypto.randomUUID();
  const trip4Id = crypto.randomUUID();

  const allTrips = [
    {
      id: trip1Id,
      routeId: route1Id,
      driverId,
      vehicleId: vehicle1Id,
      date: today,
      scheduledStartTime: "07:30",
      status: "scheduled",
    },
    {
      id: trip2Id,
      routeId: route2Id,
      driverId: driver2Id,
      vehicleId: vehicle2Id,
      date: today,
      scheduledStartTime: "08:00",
      status: "scheduled",
    },
    {
      id: trip3Id,
      routeId: route1Id,
      driverId,
      vehicleId: vehicle1Id,
      date: tomorrow,
      scheduledStartTime: "07:30",
      status: "scheduled",
    },
    {
      id: trip4Id,
      routeId: route2Id,
      driverId: driver2Id,
      vehicleId: vehicle2Id,
      date: tomorrow,
      scheduledStartTime: "08:00",
      status: "scheduled",
    },
  ];

  // Generate more trips for the next 30 days
  for (let i = 2; i < 30; i++) {
    const date = new Date(Date.now() + i * 86400000)
      .toISOString()
      .split("T")[0];

    allTrips.push({
      id: crypto.randomUUID(),
      routeId: route1Id,
      driverId,
      vehicleId: vehicle1Id,
      date: date,
      scheduledStartTime: "07:30",
      status: "scheduled",
    });

    allTrips.push({
      id: crypto.randomUUID(),
      routeId: route2Id,
      driverId: driver2Id,
      vehicleId: vehicle2Id,
      date: date,
      scheduledStartTime: "08:00",
      status: "scheduled",
    });
  }

  await db.insert(schema.trips).values(allTrips);

  console.log("✅ Trips created");

  // Create sample bookings
  await db.insert(schema.bookings).values([
    {
      id: crypto.randomUUID(),
      tripId: trip1Id,
      studentId: student1Id,
      parentId,
      pickupStopId: stop2Id,
      dropoffStopId: stop4Id,
      status: "confirmed",
      seatNumber: 1,
    },
    {
      id: crypto.randomUUID(),
      tripId: trip2Id,
      studentId: student2Id,
      parentId,
      pickupStopId: stop6Id,
      dropoffStopId: stop7Id,
      status: "confirmed",
      seatNumber: 1,
    },
    {
      id: crypto.randomUUID(),
      tripId: trip1Id,
      studentId: student3Id,
      parentId: parent2Id,
      pickupStopId: stop3Id,
      dropoffStopId: stop4Id,
      status: "confirmed",
      seatNumber: 2,
    },
    {
      id: crypto.randomUUID(),
      tripId: trip3Id,
      studentId: student1Id,
      parentId,
      pickupStopId: stop2Id,
      dropoffStopId: stop4Id,
      status: "pending",
      seatNumber: 1,
    },
  ]);

  console.log("✅ Bookings created");

  console.log("");
  console.log("🎉 Seed completed!");
  console.log("");
  console.log("Test accounts (password: password123):");
  console.log("  Admin:  admin@glidee.com");
  console.log("  Driver: driver@glidee.com");
  console.log("  Parent: parent@glidee.com");
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });
