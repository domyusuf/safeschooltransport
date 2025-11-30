import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

type NotificationType = "info" | "success" | "warning" | "alert";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Bus Approaching",
    message: "Bus 42 is 2 minutes away from your pickup location.",
    time: "2 mins ago",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "Child Boarded",
    message: "Emma has boarded Bus 42 at 123 Oak Street.",
    time: "15 mins ago",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Route Delay",
    message: "Bus 15 is experiencing a 10-minute delay due to traffic.",
    time: "1 hour ago",
    type: "warning",
    read: true,
  },
  {
    id: "4",
    title: "Safe Arrival",
    message: "Emma has been safely dropped off at Lincoln High School.",
    time: "2 hours ago",
    type: "success",
    read: true,
  },
  {
    id: "5",
    title: "Booking Confirmed",
    message: "Your ride booking for tomorrow has been confirmed.",
    time: "1 day ago",
    type: "info",
    read: true,
  },
  {
    id: "6",
    title: "Emergency Alert",
    message: "Weather advisory: School buses may experience delays tomorrow.",
    time: "2 days ago",
    type: "alert",
    read: true,
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case "warning":
      return <Clock className="w-6 h-6 text-yellow-500" />;
    case "alert":
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    default:
      return <Info className="w-6 h-6 text-blue-500" />;
  }
};

const getNotificationBg = (type: NotificationType, read: boolean) => {
  if (read) return "bg-white";
  switch (type) {
    case "success":
      return "bg-green-50";
    case "warning":
      return "bg-yellow-50";
    case "alert":
      return "bg-red-50";
    default:
      return "bg-blue-50";
  }
};

function NotificationsPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm">
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {mockNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`${getNotificationBg(
              notification.type,
              notification.read
            )} ${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`font-medium ${
                        notification.read ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 shrink-0">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {mockNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {mockNotifications.length > 0 && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Notifications
          </Button>
        </div>
      )}
    </div>
  );
}
