import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getParentStudents, addStudent, updateProfile } from "@/server";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", image: "" });
  const [newStudent, setNewStudent] = useState({
    name: "",
    schoolName: "",
    grade: "",
  });

  const { data: students = [] } = useSuspenseQuery({
    queryKey: ["parentStudents"],
    queryFn: () => getParentStudents(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => updateProfile({ data: profileForm }),
    onSuccess: async () => {
      await router.invalidate();
      setIsEditProfileOpen(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: user?.name || "",
      image: user?.image || "",
    });
    setIsEditProfileOpen(true);
  };

  const addStudentMutation = useMutation({
    mutationFn: () => addStudent({ data: newStudent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parentStudents"] });
      setIsAddChildOpen(false);
      setNewStudent({ name: "", schoolName: "", grade: "" });
      toast.success("Child added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add child");
    },
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentMutation.mutate();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth/login" });
  };
  return (
    <div className="p-4 pb-24">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="bg-blue-600 text-white text-2xl">
            {(user?.name ?? "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.name ?? "User"}
        </h1>
        <p className="text-gray-600">{user?.email ?? ""}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={handleOpenEditProfile}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Personal Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email ?? "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">Not set</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">Not set</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children/Students */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5" />
              My Children
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddChildOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {students.length === 0 ? (
            <Empty className="py-8">
              <EmptyMedia variant="icon">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No children added</EmptyTitle>
                <EmptyDescription>
                  Add your children to start booking rides for them.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={() => setIsAddChildOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            students.map((student, index) => (
              <div key={student.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.grade} • {student.schoolName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Settings Links */}
      <Card className="mb-4">
        <CardContent className="p-0">
          {[
            { icon: Bell, label: "Notification Settings", href: "/profile" },
            { icon: Shield, label: "Privacy & Security", href: "/profile" },
            { icon: CreditCard, label: "Payment Methods", href: "/profile" },
          ].map((item, index) => (
            <div key={item.label}>
              {index > 0 && <Separator />}
              <Link
                to={item.href}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>

      {/* App Version */}
      <p className="text-center text-sm text-gray-400 mt-6">Glidee v1.0.0</p>

      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
            <DialogDescription>
              Enter your child's details to add them to your profile.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={newStudent.schoolName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, schoolName: e.target.value })
                }
                placeholder="Lincoln High School"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={newStudent.grade}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, grade: e.target.value })
                }
                placeholder="10th Grade"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddChildOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addStudentMutation.isPending}>
                {addStudentMutation.isPending ? "Adding..." : "Add Child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                placeholder="Your Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-image">Profile Picture URL</Label>
              <Input
                id="profile-image"
                value={profileForm.image}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, image: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500">
                Enter a URL for your profile picture.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
