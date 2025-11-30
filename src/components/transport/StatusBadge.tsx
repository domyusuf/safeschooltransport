import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TripStatus =
  | "on-time"
  | "delayed"
  | "cancelled"
  | "completed"
  | "in-progress"
  | "scheduled"
  | "boarding";

export type VehicleStatus = "active" | "maintenance" | "inactive";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: TripStatus | VehicleStatus | BookingStatus;
  className?: string;
}

const statusConfig: Record<
  TripStatus | VehicleStatus | BookingStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "secondary";
  }
> = {
  // Trip statuses
  "on-time": { label: "On Time", variant: "success" },
  delayed: { label: "Delayed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
  "in-progress": { label: "In Progress", variant: "default" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  boarding: { label: "Boarding", variant: "warning" },
  // Vehicle statuses
  active: { label: "Active", variant: "success" },
  maintenance: { label: "Maintenance", variant: "warning" },
  inactive: { label: "Inactive", variant: "secondary" },
  // Booking statuses
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
