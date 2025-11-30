import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import {
  Bus,
  Shield,
  Clock,
  MapPin,
  Bell,
  ArrowRight,
  Star,
  User,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  // Client-side session check for navbar only - no blocking
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const userRole = (session?.user as { role?: string })?.role ?? "parent";
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Safety First",
      description:
        "Real-time GPS tracking, verified drivers, and instant alerts keep your children safe every step of the way.",
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Always On Time",
      description:
        "Optimized routes and live traffic updates ensure punctual pickups and drop-offs, every single day.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Live Tracking",
      description:
        "Know exactly where your child is with real-time bus location tracking on your phone.",
    },
    {
      icon: <Bell className="w-8 h-8 text-blue-600" />,
      title: "Instant Alerts",
      description:
        "Get notified when the bus is approaching, when your child boards, and when they arrive safely.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Parent of 2",
      content:
        "Glidee has completely transformed our morning routine. I always know when the bus is coming!",
      rating: 5,
    },
    {
      name: "David L.",
      role: "School Administrator",
      content:
        "Managing transport for 500+ students is now effortless. The real-time dashboard is incredible.",
      rating: 5,
    },
    {
      name: "Michael T.",
      role: "Bus Driver",
      content:
        "The driver app is so easy to use. Large buttons, clear directions - exactly what we need.",
      rating: 5,
    },
  ];

  // Get dashboard link based on role
  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return "/admin";
      case "driver":
        return "/driver/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">Glidee</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Safe School Transport,
            <br />
            <span className="text-blue-200">Made Simple</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Real-time tracking, instant notifications, and seamless booking.
            Give your child the safest journey to and from school.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
              >
                Register as Parent
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Register as School
              </Button>
            </Link>
          </div>
        </div>

        {/* Wave decoration */}
        <svg
          className="w-full h-16 text-white"
          viewBox="0 0 1440 48"
          fill="currentColor"
        >
          <path d="M0,48L80,42.7C160,37,320,27,480,26.7C640,27,800,37,960,37.3C1120,37,1280,27,1360,21.3L1440,16L1440,48L1360,48C1280,48,1120,48,960,48C800,48,640,48,480,48C320,48,160,48,80,48L0,48Z" />
        </svg>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Parents Trust Glidee
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built the most comprehensive school transport solution with
              safety and reliability at its core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Register",
                desc: "Create your account and add your children's profiles",
              },
              {
                step: "2",
                title: "Book Rides",
                desc: "Select pickup points and schedule rides in seconds",
              },
              {
                step: "3",
                title: "Track & Relax",
                desc: "Get real-time updates and notifications throughout the journey",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Parents & Schools
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-8">
            Join thousands of parents who trust Glidee for safe, reliable school
            transport.
          </p>
          <Link to="/auth/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Bus className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">Glidee</span>
            </div>
            <p className="text-sm">© 2024 Glidee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
