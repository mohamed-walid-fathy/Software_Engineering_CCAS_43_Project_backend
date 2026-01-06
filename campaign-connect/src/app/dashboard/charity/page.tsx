"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, Users, TrendingUp, Plus,
  Settings, BarChart3, FileText, ArrowUpRight,
  Eye, Edit, PauseCircle, Heart, Loader2, Clock,
  Building2, PlusCircle, LogOut, ChevronRight, Calendar,
  Activity, CheckCircle2, Trash2, CreditCard, Lock, AlertCircle, XCircle, RefreshCw
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { campaignsApi, donationsApi, authApi, charityApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Campaign {
  id: string;
  title: string;
  status: string;
  current_amount: number;
  target_amount: number;
  donor_count?: number;
  end_date: string;
  rejection_reason?: string;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  campaign_title: string;
  time: string;
}

interface Stats {
  totalRaised: number;
  totalDonors: number;
  activeCampaigns: number;
  monthlyRaised: number;
}

interface Stats {
  totalRaised: number;
  totalDonors: number;
  activeCampaigns: number;
  monthlyRaised: number;
}

// Edit Charity Dialog (Resubmit)
function EditCharityDialog({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [description, setDescription] = useState(user.description || "");
  const [email, setEmail] = useState(user.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!firstName || !lastName || !description) {
      toast({ title: "Error", description: "First name, last name, and description are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const charityId = user.charity_id || user.Charity_id || user.id;
      // Get token from local storage or context if available (assuming generic token for now)
      const token = localStorage.getItem("token") || "";

      const result = await charityApi.update(charityId, {
        first_name: firstName,
        last_name: lastName,
        description,
        email
      }, token);

      if (result.error) throw new Error(result.error);

      toast({ title: "Success", description: "Application updated and resubmitted for review!" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Edit className="mr-2 h-4 w-4" />
          Edit Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
          <DialogDescription>
            Update your details to address the rejection reason and resubmit for verification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-fname">First Name</Label>
              <Input id="c-fname" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-lname">Last Name</Label>
              <Input id="c-lname" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea id="c-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Resubmit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Campaign Dialog
function EditCampaignDialog({ campaign, onSuccess }: { campaign: any, onSuccess: () => void }) {
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description || ""); // Assuming description exists on campaign object
  // Add other fields as necessary, keeping it simple for now
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // If rejected, we might want to call reapply or update. 
      // If we update, it should probably reset status to pending handled by backend or explicit reapply call.
      // For now, let's assume update is enough if backend handles it, 
      // OR we call reapply after update. Implementation plan said update should reset status.

      const result = await campaignsApi.update(campaign.id, {
        title,
        description
      });

      if (result.error) throw new Error(result.error);

      // If it was rejected, we also need to potentially trigger functionality to reset status 
      // if the update endpoint doesn't do it automatically (which currently it doesn't in default implementation).
      // However, we implemented reapplyCampaign in backend. But wait, did we implement updateCampaign?
      // The backend reapplyCampaign just clears rejection reason.
      // Let's assume we call update then reapply.

      if (campaign.status === 'rejected') {
        await campaignsApi.reapplyCampaign(campaign.id);
      }

      toast({ title: "Success", description: "Campaign updated successfully" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          {campaign.status === 'rejected' && (
            <DialogDescription className="text-destructive">
              Reason for rejection: {campaign.rejection_reason}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cp-title">Title</Label>
            <Input id="cp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-desc">Description</Label>
            <Textarea id="cp-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Saving..." : (campaign.status === 'rejected' ? "Save & Resubmit" : "Save Changes")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Card and Delete Account components (reused/slightly adapted from donor dashboard)

// Create Campaign Dialog
function CreateCampaignDialog({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title || !description || !targetAmount || !category || !endDate) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const charityId = user.charity_id || user.Charity_id || user.id;
      const result = await campaignsApi.create({
        title,
        description,
        target_amount: parseFloat(targetAmount),
        category,
        end_date: endDate,
        charity_id: charityId
      });

      if (result.error) throw new Error(result.error);
      toast({ title: "Success", description: "Campaign created successfully!" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) { setTitle(""); setDescription(""); setTargetAmount(""); setEndDate(""); } }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Launch a new fundraising initiative to support your cause.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input id="title" placeholder="e.g. Winter Relief Fund" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" placeholder="Describe your cause..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Amount ($)</Label>
              <Input id="target" type="number" placeholder="5000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">End Date</Label>
            <Input id="date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Launch Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Change Password Dialog Component
function ChangePasswordDialog({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.resetPassword(user.email, newPassword);
      if (result.error) throw new Error(result.error);
      toast({ title: "Success", description: "Password updated successfully" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Lock className="h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update your account password to keep it secure.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleReset} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your charity account
            and remove all campaign data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CharityDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonors: 0,
    activeCampaigns: 0,
    verifiedStatus: "pending"
  });
  const [isCreating, setIsCreating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null); // To store fresh user data including rejection reason
  const [activeTab, setActiveTab] = useState("campaigns");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && user.role !== "charity") {
      router.push("/dashboard/" + user.role);
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const charityId = (user as any).charity_id || (user as any).Charity_id || user.id;

        // 1. Fetch campaigns
        const campaignsRes = await campaignsApi.getAll({ charity_id: charityId });
        const rawCampaigns = (campaignsRes.data as any)?.data || [];
        setCampaigns(rawCampaigns.map((c: any) => ({
          id: c.campaign_id,
          title: c.title,
          description: c.description, // Added description for edit
          raised: parseFloat(c.current_amount),
          goal: parseFloat(c.target_amount),
          donors: c.donor_count || 0,
          status: c.status,
          rejection_reason: c.rejection_reason,
          daysLeft: getDaysLeft(c.end_date)
        })));

        // 2. Fetch platform/charity stats
        const statsRes = await charityApi.getStats(charityId);
        if (statsRes.data) {
          const s = (statsRes.data as any).data;
          if (s) {
            setStats({
              totalRaised: s.total_raised || 0,
              totalDonors: s.total_donors || 0,
              activeCampaigns: s.active_campaigns || 0,
              verifiedStatus: (user as any).verified_status || "pending"
            });
            setAnalyticsData(s);
          }
        }

        // Fetch fresh user data to check for rejection
        const profileRes = await charityApi.getById(charityId);
        if (profileRes.data) {
          const profile = (profileRes.data as any).data || (profileRes.data as any);
          if (profile) {
            setCurrentUserData(profile);
            if (profile.verified_status !== 'verified' && profile.rejection_reason) {
              setRejectionReason(profile.rejection_reason);
            } else {
              setRejectionReason(null);
            }
          }
        }

        // 3. Fetch recent donations
        const donationsRes = await donationsApi.getAll({ charity_id: charityId, limit: 10 });
        const rawDonations = (donationsRes.data as any)?.data || [];
        setDonations(rawDonations.map((d: any) => ({
          id: d.donation_id,
          donor: d.donor_id === 1 ? "Anonymous" : (d.donor ? `${d.donor.first_name} ${d.donor.last_name}` : "Kind Donor"),
          campaign: (d.campaign || d.Campaign)?.title || "Active Campaign",
          amount: parseFloat(d.amount),
          time: new Date(d.donation_date || d.created_at).toLocaleDateString()
        })));
      } catch (err) {
        console.error("Failed to fetch charity dashboard data:", err);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoading, router]);

  // Helper for days left
  const getDaysLeft = (endDate: string) => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // RBAC will handle redirect
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.first_name ? user.first_name.charAt(0) : user.name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.first_name} {user.last_name || user.name}</h1>
                  {(user as any).verified_status === 'verified' && (
                    <Badge variant="outline" className="text-success border-success">Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Charity Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ChangePasswordDialog user={user} onSuccess={() => { }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <DeleteAccountDialog />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CreateCampaignDialog user={user} onSuccess={() => window.location.reload()} />
            </div>
          </div>

          {/* Rejection Alert */}
          {rejectionReason && (
            <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Application Rejected</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Your charity application was rejected. Please review the reason below and update your application.
                </p>
                <EditCharityDialog
                  user={currentUserData || user}
                  onSuccess={() => window.location.reload()}
                />
              </AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold">${(stats.totalRaised || 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donors</p>
                    <p className="text-2xl font-bold">{(stats.totalDonors || 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Status</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        {stats.verifiedStatus === 'verified' ? (
                          <Badge variant="outline" className="text-success border-success px-1 py-0 h-5">Verified</Badge>
                        ) : rejectionReason ? (
                          <Badge variant="outline" className="text-destructive border-destructive px-1 py-0 h-5">Rejected</Badge>
                        ) : (
                          <Badge variant="outline" className="text-warning border-warning px-1 py-0 h-5">Pending</Badge>
                        )}
                      </div>
                      {rejectionReason && (
                        <p className="text-xs text-destructive mt-1 font-medium">
                          Reason: {rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="donations">Recent Donations</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <Card>
                <CardHeader>
                  <CardTitle>Your Campaigns</CardTitle>
                  <CardDescription>Manage and monitor all your fundraising campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
                        <Heart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                        <p className="text-muted-foreground">No campaigns found</p>
                        <Button variant="link" className="mt-2">Create your first campaign</Button>
                      </div>
                    ) : campaigns.map((campaign) => {
                      const progress = (campaign.raised / campaign.goal) * 100;

                      return (
                        <div
                          key={campaign.id}
                          className="flex flex-col md:flex-row md:items-center gap-4 rounded-lg border p-4"
                        >
                          <div className="h-20 w-32 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                            <Heart className="h-8 w-8" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{campaign.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={campaign.status === "active" ? "default" : campaign.status === "rejected" ? "destructive" : "secondary"}>
                                    {campaign.status}
                                  </Badge>
                                  {campaign.daysLeft > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {campaign.daysLeft} days left
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-success">
                                  ${campaign.raised.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  of ${campaign.goal.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{campaign.donors} donors</span>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-1 h-4 w-4" />
                                  View
                                </Button>
                                <EditCampaignDialog
                                  campaign={campaign}
                                  onSuccess={() => window.location.reload()}
                                />
                              </div>
                            </div>
                            {campaign.status === 'rejected' && campaign.rejection_reason && (
                              <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                                <strong>Rejected:</strong> {campaign.rejection_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>Latest contributions to your campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donations.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground">No donations yet</p>
                      </div>
                    ) : donations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{donation.donor.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{donation.donor}</p>
                            <p className="text-sm text-muted-foreground">{donation.campaign}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${donation.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{donation.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Performance Reports</CardTitle>
                    <CardDescription>Generate on-the-fly reports for any date range</CardDescription>
                  </div>
                  <GenerateReportDialog
                    charityId={(user as any).charity_id || (user as any).Charity_id || user.id}
                  />
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Performance Indicators (Existing Summary) */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Monthly Report Summary */}
                    <div className="rounded-lg border p-6 bg-muted/20">
                      <div className="flex items-center gap-3 mb-6">
                        <Activity className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">Current Period Summary</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Donations</span>
                          <span className="font-semibold">{analyticsData?.total_donations || 0}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-semibold text-success">${(analyticsData?.total_amount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Unique Donors</span>
                          <span className="font-semibold">{analyticsData?.unique_donors || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Donor Analytics Summary (Historical trends from stats) */}
                    <div className="rounded-lg border p-6 bg-muted/20">
                      <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h3 className="font-bold text-lg">Platform Trends</h3>
                      </div>
                      <div className="space-y-4">
                        {analyticsData?.donation_trends?.map((item: any) => (
                          <div key={item.month} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.month}</span>
                              <span className="font-medium">${(item.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(item.amount / (analyticsData.total_raised || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {!analyticsData?.donation_trends?.length && <p className="text-muted-foreground text-sm py-4 text-center">No trend data available yet.</p>}
                      </div>
                    </div>
                  </div>

                  {/* Campaign Breakdown */}
                  {analyticsData?.campaign_performance && (
                    <div className="mt-6">
                      <h3 className="font-bold mb-4 text-lg">Campaign Performance</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {analyticsData.campaign_performance.map((c: any) => (
                          <div key={c.title} className="p-4 rounded-lg border bg-card">
                            <p className="text-sm font-medium text-muted-foreground truncate mb-1">{c.title}</p>
                            <p className="text-xl font-bold text-success">${c.raised.toLocaleString()}</p>
                            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${Math.min(100, (c.raised / (c.target || 1)) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {Math.round((c.raised / (c.target || 1)) * 100)}% of goal
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Generate Report Dialog (Calculates on-the-fly)
function GenerateReportDialog({ charityId }: { charityId: string }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!start || !end) {
      toast({ title: "Error", description: "Please select start and end dates.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await charityApi.getCustomReport(charityId, start, end);
      if (result.error) throw new Error(result.error);
      setReportResult((result.data as any).data || result.data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Custom Report</DialogTitle>
          <DialogDescription>Calculate performance for a specific period without database persistence.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? "Calculating..." : "Calculate Report Stats"}
          </Button>

          {reportResult && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Raised</p>
                  <p className="text-xl font-bold text-success">${reportResult.total_amount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Donations</p>
                  <p className="text-xl font-bold">{reportResult.total_donations}</p>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Unique Donors</p>
                  <p className="text-xl font-bold">{reportResult.unique_donors}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">Campaign Breakdown</h4>
                <div className="space-y-3">
                  {reportResult.campaign_breakdown.map((c: any) => (
                    <div key={c.title} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.count} donations</p>
                      </div>
                      <p className="font-bold text-success">${c.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {reportResult && (
            <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto">
              Print Report
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="ghost">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Campaign Donors Dialog
function CampaignDonorsDialog({ campaignId, campaignTitle }: { campaignId: string, campaignTitle: string }) {
  const [donors, setDonors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpen = async () => {
    setIsLoading(true);
    try {
      const result = await donationsApi.getAll({ campaign_id: campaignId });
      if (result.error) throw new Error(result.error);

      const data = (result.data as any)?.data || result.data || [];
      setDonors(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load donors list.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">View</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Donors for "{campaignTitle}"</DialogTitle>
          <DialogDescription>
            A list of all contributors who have supported this campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : donors.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No donations found for this campaign.</p>
          ) : (
            <div className="space-y-4">
              {donors.map((d: any) => (
                <div key={d.donation_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{d.donor_name?.[0] || d.donor?.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {d.is_anonymous ? "Anonymous Donor" : (d.donor_name || d.donor?.name || "Unknown Donor")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.donation_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success">${d.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground capitalize">{d.payment_method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

