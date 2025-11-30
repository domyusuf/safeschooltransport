import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  className?: string;
  label?: string;
  showPins?: boolean;
  fullScreen?: boolean;
}

export function MapPlaceholder({
  className,
  label = "Map View",
  showPins = false,
  fullScreen = false,
}: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden",
        fullScreen ? "w-full h-full min-h-[400px]" : "w-full h-64",
        className
      )}
    >
      {/* Grid pattern to simulate map */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="gray"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated roads */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-400" />
        <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-500" />
        <div className="absolute top-3/4 left-0 right-0 h-2 bg-gray-400" />
        <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-gray-400" />
        <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-gray-500" />
        <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-400" />
      </div>

      {/* Map pins */}
      {showPins && (
        <>
          <div className="absolute top-1/3 left-1/4 animate-bounce">
            <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute top-2/3 right-1/4">
            <div className="bg-green-600 text-white p-2 rounded-full shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </>
      )}

      {/* Label */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-md">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
