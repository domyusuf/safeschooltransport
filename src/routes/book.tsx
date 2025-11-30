import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  getParentStudents,
  getAvailableRoutes,
  createBooking,
} from "@/server/parent";

export const Route = createFileRoute("/book")({
  component: BookPage,
});

// Types based on server function returns
type Student = {
  id: string;
  name: string;
  schoolName: string;
  grade: string;
  photoUrl: string | null;
};

type Stop = {
  id: string;
  routeId: string;
  name: string;
  lat: number;
  lng: number;
  orderIndex: number;
  estimatedTime: string | null;
};

type Trip = {
  id: string;
  routeId: string;
  date: string;
  scheduledStartTime: string | null;
  status: string;
  vehicle: {
    id: string;
    name: string;
    plateNumber: string;
    capacity: number;
  } | null;
  driver: { id: string; name: string } | null;
  bookedSeats: number;
  availableSeats: number;
  isFull: boolean;
};

type RouteWithTrips = {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  estimatedDuration: number;
  isActive: boolean;
  stops: Stop[];
  trips: Trip[];
};

function BookPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </AppLayout>
  );
}

function BookingWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Wizard steps
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithTrips | null>(
    null
  );
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<Stop | null>(null);
  const [selectedDropoff, setSelectedDropoff] = useState<Stop | null>(null);

  // Fetch students
  const { data: students = [] } = useSuspenseQuery({
    queryKey: ["parent-students"],
    queryFn: () => getParentStudents(),
  });

  // Fetch available routes for selected date
  const { data: routes = [], refetch: refetchRoutes } = useSuspenseQuery({
    queryKey: ["available-routes", selectedDate],
    queryFn: () => getAvailableRoutes({ data: { date: selectedDate } }),
  });

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: (params: {
      tripId: string;
      studentId: string;
      pickupStopId?: string;
      dropoffStopId?: string;
    }) => createBooking({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-bookings"] });
      navigate({ to: "/dashboard" });
    },
  });

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedRoute(null);
    setSelectedTrip(null);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    refetchRoutes();
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const handleRouteSelect = (route: RouteWithTrips) => {
    setSelectedRoute(route);
    setSelectedTrip(null);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    setStep(3);
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setStep(4);
  };

  const handleStopsSelect = (pickup: Stop, dropoff: Stop) => {
    setSelectedPickup(pickup);
    setSelectedDropoff(dropoff);
    setStep(5);
  };

  const handleConfirmBooking = () => {
    if (!selectedTrip || !selectedStudent) return;

    bookingMutation.mutate({
      tripId: selectedTrip.id,
      studentId: selectedStudent.id,
      pickupStopId: selectedPickup?.id,
      dropoffStopId: selectedDropoff?.id,
    });
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["Student", "Date & Route", "Trip", "Stops", "Confirm"].map(
              (label, index) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step > index + 1
                        ? "bg-green-500 text-white"
                        : step === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > index + 1 ? "✓" : index + 1}
                  </div>
                  <span className="ml-2 text-sm hidden sm:inline">{label}</span>
                  {index < 4 && (
                    <div
                      className={`w-8 sm:w-16 h-1 mx-2 ${
                        step > index + 1 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Step 1: Select Student */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select a Student
              </h2>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">👶</div>
                  <p className="text-gray-600 mb-4">
                    No students found. Please add a student first.
                  </p>
                  <button
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="flex items-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {student.schoolName} • Grade {student.grade}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Date & Route */}
          {step === 2 && (
            <div>
              <button
                onClick={goBack}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select Date & Route
              </h2>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Routes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Available Routes
                </h3>
                {routes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No routes available for this date.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {routes.map((route) => (
                      <button
                        key={route.id}
                        onClick={() =>
                          handleRouteSelect(route as RouteWithTrips)
                        }
                        disabled={route.trips.length === 0}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          route.trips.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {route.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {route.startPoint} → {route.endPoint}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              route.trips.length > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {route.trips.length} trip(s)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Trip */}
          {step === 3 && selectedRoute && (
            <div>
              <button
                onClick={goBack}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select a Trip
              </h2>
              <p className="text-gray-600 mb-6">Route: {selectedRoute.name}</p>

              <div className="grid gap-4">
                {selectedRoute.trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => handleTripSelect(trip)}
                    disabled={trip.isFull}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      trip.isFull
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          🕐 {trip.scheduledStartTime || "TBD"}
                        </p>
                        {trip.vehicle && (
                          <p className="text-sm text-gray-500 mt-1">
                            🚐 {trip.vehicle.name} ({trip.vehicle.plateNumber})
                          </p>
                        )}
                        {trip.driver && (
                          <p className="text-sm text-gray-500">
                            👤 Driver: {trip.driver.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            trip.isFull
                              ? "bg-red-100 text-red-800"
                              : trip.availableSeats <= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {trip.isFull
                            ? "Full"
                            : `${trip.availableSeats} seats available`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Pickup & Dropoff */}
          {step === 4 && selectedRoute && (
            <div>
              <button
                onClick={goBack}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select Pickup & Dropoff Stops
              </h2>

              <StopSelector
                stops={selectedRoute.stops}
                onConfirm={handleStopsSelect}
              />
            </div>
          )}

          {/* Step 5: Confirm Booking */}
          {step === 5 && (
            <div>
              <button
                onClick={goBack}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Confirm Booking
              </h2>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium">{selectedStudent?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium">{selectedRoute?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Trip Time</p>
                  <p className="font-medium">
                    {selectedTrip?.scheduledStartTime || "TBD"}
                  </p>
                </div>
                {selectedPickup && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Pickup Stop</p>
                    <p className="font-medium">{selectedPickup.name}</p>
                    {selectedPickup.estimatedTime && (
                      <p className="text-sm text-gray-400">
                        Est. time: {selectedPickup.estimatedTime}
                      </p>
                    )}
                  </div>
                )}
                {selectedDropoff && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Dropoff Stop</p>
                    <p className="font-medium">{selectedDropoff.name}</p>
                    {selectedDropoff.estimatedTime && (
                      <p className="text-sm text-gray-400">
                        Est. time: {selectedDropoff.estimatedTime}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {bookingMutation.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {bookingMutation.error instanceof Error
                    ? bookingMutation.error.message
                    : "Failed to create booking"}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={bookingMutation.isPending}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stop Selector Component
function StopSelector({
  stops,
  onConfirm,
}: {
  stops: Stop[];
  onConfirm: (pickup: Stop, dropoff: Stop) => void;
}) {
  const [pickup, setPickup] = useState<Stop | null>(null);
  const [dropoff, setDropoff] = useState<Stop | null>(null);

  const handleConfirm = () => {
    if (pickup && dropoff) {
      onConfirm(pickup, dropoff);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pickup Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Select Pickup Stop
        </h3>
        <div className="grid gap-2">
          {stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => setPickup(stop)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                pickup?.id === stop.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-300"
              }`}
            >
              <p className="font-medium">{stop.name}</p>
              {stop.estimatedTime && (
                <p className="text-sm text-gray-500">{stop.estimatedTime}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dropoff Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Select Dropoff Stop
        </h3>
        <div className="grid gap-2">
          {stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => setDropoff(stop)}
              disabled={pickup?.id === stop.id}
              className={`p-3 border rounded-lg text-left transition-colors ${
                dropoff?.id === stop.id
                  ? "border-green-500 bg-green-50"
                  : pickup?.id === stop.id
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-gray-300"
              }`}
            >
              <p className="font-medium">{stop.name}</p>
              {stop.estimatedTime && (
                <p className="text-sm text-gray-500">{stop.estimatedTime}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!pickup || !dropoff}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Confirmation
      </button>
    </div>
  );
}
