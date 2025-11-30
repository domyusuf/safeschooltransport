import { Card, CardContent } from "@/components/ui/card";
import {
  StatusBadge,
  type TripStatus,
  type BookingStatus,
} from "./StatusBadge";
import { MapPin, Clock, Bus, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface BookingCardProps {
  id: string;
  studentName: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: string;
  busNumber: string;
  driverName: string;
  status: TripStatus | BookingStatus;
  className?: string;
}

export function BookingCard({
  id,
  studentName,
  pickupLocation,
  dropoffLocation,
  scheduledTime,
  busNumber,
  driverName,
  status,
  className,
}: BookingCardProps) {
  return (
    <Link to="/rides/$rideId" params={{ rideId: id }}>
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{studentName}</span>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 flex-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 truncate">{pickupLocation}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-1 flex-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-gray-600 truncate">
                  {dropoffLocation}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{scheduledTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Bus className="w-4 h-4" />
                <span>{busNumber}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span>{driverName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
