import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reportIncident } from "@/server/driver";
import {
  ArrowLeft,
  AlertTriangle,
  Car,
  CloudRain,
  Construction,
  Phone,
  Camera,
  Send,
  MapPin,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/driver/incidents")({
  component: IncidentsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tripId: (search.tripId as string) || undefined,
  }),
});

type IncidentType =
  | "breakdown"
  | "accident"
  | "weather"
  | "road-closure"
  | "other";

const incidentTypes: {
  type: IncidentType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    type: "breakdown",
    label: "Vehicle Breakdown",
    icon: <Car className="w-8 h-8" />,
    color: "bg-orange-100 text-orange-600 border-orange-300",
  },
  {
    type: "accident",
    label: "Accident",
    icon: <AlertTriangle className="w-8 h-8" />,
    color: "bg-red-100 text-red-600 border-red-300",
  },
  {
    type: "weather",
    label: "Bad Weather",
    icon: <CloudRain className="w-8 h-8" />,
    color: "bg-blue-100 text-blue-600 border-blue-300",
  },
  {
    type: "road-closure",
    label: "Road Closure",
    icon: <Construction className="w-8 h-8" />,
    color: "bg-yellow-100 text-yellow-600 border-yellow-300",
  },
];

function IncidentsPage() {
  const navigate = useNavigate();
  const { tripId } = useSearch({ from: "/driver/incidents" });
  const [selectedType, setSelectedType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const incidentMutation = useMutation({
    mutationFn: () => {
      if (!tripId) throw new Error("No trip ID provided");
      if (!selectedType) throw new Error("Please select an incident type");
      if (description.length < 10)
        throw new Error("Please provide more details");

      // Map UI severity to API severity
      const severityMap: Record<
        IncidentType,
        "low" | "medium" | "high" | "critical"
      > = {
        breakdown: "high",
        accident: "critical",
        weather: "medium",
        "road-closure": "medium",
        other: "low",
      };

      return reportIncident({
        data: {
          tripId,
          description: `[${selectedType.toUpperCase()}] ${description}`,
          severity: severityMap[selectedType],
          location: location || undefined,
        },
      });
    },
    onSuccess: () => {
      navigate({ to: "/driver/dashboard" });
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Failed to report incident"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tripId) {
      setError("No active trip. Please start a trip first.");
      return;
    }

    incidentMutation.mutate();
  };

  const handleEmergency = () => {
    // Mock emergency call
    alert("Calling emergency services...");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/driver/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">Report an Incident</h1>
        <p className="text-gray-600">
          Select the type of incident and provide details
        </p>
      </div>

      {/* Emergency Button - Always visible */}
      <Button
        variant="destructive"
        size="xl"
        className="w-full mb-6 h-20"
        onClick={handleEmergency}
      >
        <Phone className="w-8 h-8 mr-3" />
        <div className="text-left">
          <div className="text-lg font-bold">Emergency Call</div>
          <div className="text-sm opacity-90">Tap for immediate assistance</div>
        </div>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Type Selection - Large touch targets */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Type of Incident
          </Label>
          <div className="grid grid-cols-2 gap-4">
            {incidentTypes.map(({ type, label, icon, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedType === type
                    ? `${color} ring-2 ring-offset-2 ring-blue-500`
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {icon}
                <span className="font-medium text-sm text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                placeholder="Enter location or use current"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 text-base"
              />
              <Button type="button" variant="outline" className="w-full">
                <MapPin className="w-5 h-5 mr-2" />
                Use Current Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Describe what happened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </CardContent>
        </Card>

        {/* Photo Upload Placeholder */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Add Photos (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Tap to add photos</p>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="xl"
          className="w-full h-16"
          disabled={!selectedType || incidentMutation.isPending}
        >
          <Send className="w-6 h-6 mr-2" />
          {incidentMutation.isPending ? "Submitting..." : "Submit Report"}
        </Button>
      </form>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Submitting a report will immediately notify
            the admin team. If students are on board, their parents will also be
            notified of any delays.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
