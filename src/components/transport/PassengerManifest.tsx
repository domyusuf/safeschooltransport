import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { MapPin, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Passenger {
  id: string;
  name: string;
  avatar?: string;
  stopName: string;
  isBoarded: boolean;
}

interface PassengerManifestProps {
  passengers: Passenger[];
  onBoardPassenger?: (passengerId: string) => void;
  onDropPassenger?: (passengerId: string) => void;
  isActiveTrip?: boolean;
  className?: string;
}

export function PassengerManifest({
  passengers,
  onBoardPassenger,
  onDropPassenger,
  isActiveTrip = false,
  className,
}: PassengerManifestProps) {
  const boardedCount = passengers.filter((p) => p.isBoarded).length;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            Passenger Manifest
          </h3>
          <span className="text-sm text-gray-500">
            {boardedCount}/{passengers.length} Boarded
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {passengers.map((passenger) => (
          <div
            key={passenger.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              passenger.isBoarded
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200"
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={passenger.avatar} alt={passenger.name} />
                <AvatarFallback>
                  {passenger.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{passenger.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {passenger.stopName}
                </p>
              </div>
            </div>

            {isActiveTrip && (
              <div className="flex gap-2">
                {!passenger.isBoarded ? (
                  <Button
                    size="lg"
                    variant="success"
                    onClick={() => onBoardPassenger?.(passenger.id)}
                    className="min-w-[100px]"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Board
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="warning"
                    onClick={() => onDropPassenger?.(passenger.id)}
                    className="min-w-[100px]"
                  >
                    Drop Off
                  </Button>
                )}
              </div>
            )}

            {!isActiveTrip && passenger.isBoarded && (
              <StatusBadge status="completed" />
            )}
          </div>
        ))}

        {passengers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No passengers for this stop</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
